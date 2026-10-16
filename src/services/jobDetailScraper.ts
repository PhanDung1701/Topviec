import { JobListing, PlatformSource } from "@/types/job";

// In-memory cache for fast instant rendering on modal open
const detailCache = new Map<string, JobListing>();

/**
 * Clean HTML strings into formatted readable text
 */
function cleanText(str: string): string {
  if (!str) return "";
  return str
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");
}

function cleanBullets(str: string): string[] {
  if (!str) return [];
  const text = cleanText(str);
  return text
    .split("\n")
    .map((line) => line.replace(/^[-*•\s]+/, "").trim())
    .filter((line) => line.length > 0 && !line.startsWith("==="));
}

/**
 * Extract structured description sections from text with headings like "* Quản lý hệ thống CNTT"
 */
function parseDescriptionSections(rawText: string): { heading: string; items: string[] }[] {
  const lines = rawText.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
  const sections: { heading: string; items: string[] }[] = [];
  let currentHeading = "Nhiệm vụ chính";
  let currentItems: string[] = [];

  for (const line of lines) {
    if (
      line.startsWith("*") ||
      line.startsWith("【") ||
      line.startsWith("1.") ||
      line.startsWith("2.") ||
      line.startsWith("3.") ||
      line.startsWith("4.") ||
      line.startsWith("5.")
    ) {
      if (currentItems.length > 0) {
        sections.push({ heading: currentHeading, items: [...currentItems] });
        currentItems = [];
      }
      currentHeading = line.replace(/^[*【】\d\.\s]+/, "").trim();
    } else {
      const cleanLine = line.replace(/^[-•\s]+/, "").trim();
      if (cleanLine) {
        currentItems.push(cleanLine);
      }
    }
  }

  if (currentItems.length > 0) {
    sections.push({ heading: currentHeading, items: currentItems });
  }

  return sections;
}

/**
 * 1. CAREERLINK DETAILED SCRAPER (100% Full Content Matching Original Page)
 */
export async function scrapeCareerLinkDetail(
  url: string,
  baseJob: JobListing
): Promise<JobListing> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return baseJob;
    const html = await res.text();

    // 0. Title & Company
    const pageTitleMatch =
      html.match(/<h1[^>]*id=['"]job-title['"][^>]*>([\s\S]*?)<\/h1>/i) ||
      html.match(/<h1[^>]*class=['"][^'"]*job-title[^'"]*['"][^>]*>([\s\S]*?)<\/h1>/i);
    const parsedTitle = pageTitleMatch ? cleanText(pageTitleMatch[1]) : baseJob.title;

    const pageCompanyMatch =
      html.match(/<p[^>]*class=['"][^'"]*org-name[^'"]*['"][^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i) ||
      html.match(/<h5 class=['"]company-name-title[^'"]*['"][^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i);
    const parsedCompany = pageCompanyMatch ? cleanText(pageCompanyMatch[1]) : baseJob.company_name;

    // 1. Logo
    const logoMatch =
      html.match(/<img[^>]+class=["'][^"']*company-img[^"']*["'][^>]+src=["']([^"']+)["']/i) ||
      html.match(/<img[^>]+src=["']([^"']+)["'][^>]+class=["'][^"']*company-img/i);
    const companyLogo = logoMatch ? logoMatch[1] : baseJob.company_logo;

    // 2. Header Meta (Location, Expiry, Posted Date)
    const postDateMatch = html.match(/Ngày đăng tuyển[\s\S]*?(\d{2}-\d{2}-\d{4})/i);
    const postedDateText = postDateMatch ? postDateMatch[1] : undefined;

    const expireMatch = html.match(/Hết hạn trong:[\s\S]*?<b>([\s\S]*?)<\/b>/i);
    const deadlineText = expireMatch ? cleanText(expireMatch[1]) + " Ngày" : undefined;

    const headerLocMatch = html.match(/<div class='job-owner-info[\s\S]*?<i class='cli-location[^']*'><\/i>[\s\S]*?<span>([^<]+)<\/span>/i);
    const headerLocation = headerLocMatch ? cleanText(headerLocMatch[1]) : "";

    // 3. Sections: Description, Benefits, Skills
    const descSectionMatch = html.match(/id=['"]section-job-description['"][\s\S]*?<div class=['"]rich-text-content['"]>([\s\S]*?)<\/div>/i);
    const rawDesc = descSectionMatch ? descSectionMatch[1] : "";
    const cleanDesc = cleanText(rawDesc);
    const descSections = parseDescriptionSections(cleanDesc);
    const descItems = cleanBullets(rawDesc).filter((b) => !b.startsWith("*"));

    // Benefits
    const benefitSectionMatch = html.match(/id=['"]section-job-benefits['"]([\s\S]*?)<div class=['"]pt-4['"] id=['"]section-job-skills['"]/i);
    let parsedBenefits: string[] = [];
    if (benefitSectionMatch) {
      const benefitItemRegex = /<div class=['"]job-benefit-item[\s\S]*?<span>([\s\S]*?)<\/span>/gi;
      let bMatch: RegExpExecArray | null;
      while ((bMatch = benefitItemRegex.exec(benefitSectionMatch[1])) !== null) {
        const cleaned = cleanText(bMatch[1]).replace(/^[-*•\s]+/, "").trim();
        if (cleaned) parsedBenefits.push(cleaned);
      }
    }
    if (parsedBenefits.length === 0 && benefitSectionMatch) {
      parsedBenefits = cleanBullets(benefitSectionMatch[1]);
    }

    // Skills / Requirements
    const skillSectionMatch = html.match(/id=['"]section-job-skills['"][\s\S]*?<div class=['"][^'"]*rich-text-content['"]>([\s\S]*?)<\/div>/i);
    const rawSkills = skillSectionMatch ? skillSectionMatch[1] : "";
    const parsedReqs = cleanBullets(rawSkills);

    // 4. Job Summary / Chi tiết công việc
    const otherInfo: Record<string, string> = { ...baseJob.other_info };
    const summaryIdx = html.indexOf("id='section-job-summary'");
    if (summaryIdx !== -1) {
      const chunk = html.substring(summaryIdx, summaryIdx + 2500);
      const itemRegex = /<div class=['"]my-0 summary-label['"]>([\s\S]*?)<\/div>[\s\S]*?<div class=['"]font-weight-bolder['"]>([\s\S]*?)<\/div>/gi;
      let sMatch: RegExpExecArray | null;
      while ((sMatch = itemRegex.exec(chunk)) !== null) {
        const label = cleanText(sMatch[1]).toLowerCase();
        const val = cleanText(sMatch[2]);
        if (label.includes("loại công việc") || label.includes("hình thức")) otherInfo.work_type = val;
        if (label.includes("cấp bậc")) otherInfo.job_level = val;
        if (label.includes("học vấn") || label.includes("bằng cấp")) otherInfo.degree = val;
        if (label.includes("kinh nghiệm")) otherInfo.experience_required = val;
        if (label.includes("giới tính")) otherInfo.gender = val;
        if (label.includes("ngành nghề")) {
          otherInfo.industry_category = val.replace(/[\n\r]+/g, " ").replace(/\s*,\s*/g, ", ").trim();
        }
      }
    }

    if (postedDateText) otherInfo.posted_date_text = postedDateText;
    if (deadlineText) otherInfo.deadline_text = deadlineText;

    // 5. Contact Information / Thông tin liên hệ
    let contactName = "HCNS";
    let contactAddress = headerLocation || baseJob.address_detail;
    let contactInstructions = "";
    let contactLanguage = "Tiếng Việt";

    const contactIdx = html.indexOf("id='section-job-contact-information'");
    if (contactIdx !== -1) {
      const cHtml = html.substring(contactIdx, contactIdx + 2000);
      const nameMatch = cHtml.match(/class=['"]person-name[^'"]*['"]>([\s\S]*?)<\/span>/i);
      if (nameMatch) contactName = cleanText(nameMatch[1]);

      const locMatch = cHtml.match(/cli-location[\s\S]*?<span class=['"]align-seft-center['"]>([\s\S]*?)<\/span>/i);
      if (locMatch) {
        const parts = cleanText(locMatch[1]).split("\n").filter((p) => p.length > 0);
        contactAddress = parts.join(", ");
      }

      const noteMatch = cHtml.match(/cli-note[\s\S]*?<div class=['"]rich-text-content['"]>([\s\S]*?)<\/div>/i);
      if (noteMatch) contactInstructions = cleanText(noteMatch[1]).replace(/^[-*•\s]+/, "").trim();

      const langMatch = cHtml.match(/Nhận hồ sơ bằng ngôn ngữ:[\s\S]*?<strong>([\s\S]*?)<\/strong>/i);
      if (langMatch) contactLanguage = cleanText(langMatch[1]);
    }

    // 6. About Company / Về công ty
    let companyWebsite = "";
    let companySize = "";
    let companyIntro = "";

    const aboutIdx = html.indexOf("id='section-about-company'");
    if (aboutIdx !== -1) {
      const aHtml = html.substring(aboutIdx, aboutIdx + 2500);
      const webMatch = aHtml.match(/href=['"](https?:\/\/[^'"]+)['"]/i);
      if (webMatch) companyWebsite = webMatch[1];

      const sizeMatch = aHtml.match(/cli-users[\s\S]*?<span>([\s\S]*?)<\/span>/i);
      if (sizeMatch) companySize = cleanText(sizeMatch[1]);

      const introMatch = aHtml.match(/class=['"]text-collapse--content company-profile[^'"]*['"]>([\s\S]*?)<\/div>/i);
      if (introMatch) companyIntro = cleanText(introMatch[1]);
    }

    // 7. Keywords / Tags
    const tagsMatch = html.match(/id=['"]job-tags['"][\s\S]*?<div class=['"]raw-content['"]>([\s\S]*?)<\/div>/i);
    let pageTags: string[] = [];
    if (tagsMatch) {
      pageTags = cleanBullets(tagsMatch[1]).filter(
        (t) => t.length < 35 && !t.includes("Chia sẻ") && !t.includes("sao chép") && !t.includes("tương tự")
      );
    }
    const combinedSkills = Array.from(new Set([...baseJob.skills_tags, ...pageTags]));

    // Construct full enriched job
    const enriched: JobListing = {
      ...baseJob,
      title: parsedTitle || baseJob.title,
      company_name: parsedCompany || baseJob.company_name,
      company_logo: companyLogo && !companyLogo.includes("flaticon") ? companyLogo : baseJob.company_logo,
      description: cleanDesc.length > 100 ? cleanDesc : baseJob.description,
      description_sections: descSections.length > 0 ? descSections : undefined,
      description_items: descItems.length > 0 ? descItems : baseJob.description_items,
      requirements: parsedReqs.length > 0 ? parsedReqs : baseJob.requirements,
      benefits: parsedBenefits.length > 0 ? parsedBenefits : baseJob.benefits,
      welfare_list: parsedBenefits.length > 0 ? parsedBenefits : baseJob.welfare_list,
      address_detail: contactAddress || headerLocation || baseJob.address_detail,
      skills_tags: combinedSkills,
      company_website: companyWebsite || baseJob.company_website,
      company_size: companySize || baseJob.company_size,
      company_intro: companyIntro || baseJob.company_intro,
      contact_info: {
        name: contactName,
        address: contactAddress,
        instructions: contactInstructions,
        language: contactLanguage,
      },
      other_info: otherInfo,
    };

    return enriched;
  } catch (err) {
    console.warn("scrapeCareerLinkDetail error:", err);
    return baseJob;
  }
}

/**
 * 2. TOPCV DETAILED SCRAPER
 */
export async function scrapeTopCvDetail(
  url: string,
  baseJob: JobListing
): Promise<JobListing> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return baseJob;
    const html = await res.text();

    // Logo
    const logoMatch = html.match(/(?:data-src|src)="(https:\/\/[^"]+(?:company_logos|\.png|\.jpg)[^"]*)"/i);
    const companyLogo = logoMatch ? logoMatch[1] : baseJob.company_logo;

    // Sections in box-job-information-detail-item
    const itemRegex =
      /<div class="box-job-information-detail-item__title">[\s\S]*?<h2[^>]*>([\s\S]*?)<\/h2>[\s\S]*?<div class="box-job-information-detail-item__text">([\s\S]*?)<\/div>\s*<\/div>/gi;
    let match: RegExpExecArray | null;
    const sections: Record<string, string> = {};
    while ((match = itemRegex.exec(html)) !== null) {
      const title = cleanText(match[1]);
      sections[title] = match[2];
    }

    const descHtml = sections["Job Description"] || sections["Mô tả công việc"] || sections["Job Details"] || "";
    const reqHtml = sections["Candidate Requirements"] || sections["Yêu cầu ứng viên"] || "";
    const benefitHtml = sections["Benefits"] || sections["Quyền lợi"] || sections["Quyền lợi được hưởng"] || "";

    const cleanDesc = cleanText(descHtml);
    const descSections = parseDescriptionSections(cleanDesc);
    const descItems = cleanBullets(descHtml).filter((b) => !b.startsWith("*"));
    const parsedReqs = cleanBullets(reqHtml);
    const parsedBenefits = cleanBullets(benefitHtml);

    // Address
    const addrMatch = html.match(/box-address[\s\S]*?<div[^>]*>([\s\S]*?)<\/div>/i);
    const address = addrMatch ? cleanText(addrMatch[1]) : baseJob.address_detail;

    // Company intro
    const compIntroMatch = html.match(/class="company-description"[^>]*>([\s\S]*?)<\/div>/i);
    const compIntro = compIntroMatch ? cleanText(compIntroMatch[1]) : "";

    const enriched: JobListing = {
      ...baseJob,
      company_logo: companyLogo || baseJob.company_logo,
      description: cleanDesc.length > 100 ? cleanDesc : baseJob.description,
      description_sections: descSections.length > 0 ? descSections : undefined,
      description_items: descItems.length > 0 ? descItems : baseJob.description_items,
      requirements: parsedReqs.length > 0 ? parsedReqs : baseJob.requirements,
      benefits: parsedBenefits.length > 0 ? parsedBenefits : baseJob.benefits,
      welfare_list: parsedBenefits.length > 0 ? parsedBenefits : baseJob.welfare_list,
      address_detail: address || baseJob.address_detail,
      company_intro: compIntro || baseJob.company_intro,
      other_info: {
        ...baseJob.other_info,
        job_level: baseJob.experience_level,
        work_type: "Toàn thời gian",
      },
    };

    return enriched;
  } catch (err) {
    console.warn("scrapeTopCvDetail error:", err);
    return baseJob;
  }
}

/**
 * 3. SCHEMA.ORG & GENERIC DETAILED SCRAPER
 */
export async function scrapeGenericDetail(
  url: string,
  baseJob: JobListing
): Promise<JobListing> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return baseJob;
    const html = await res.text();

    // Check ld+json schema.org JobPosting
    const schemaMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
    if (schemaMatch) {
      try {
        const schema = JSON.parse(schemaMatch[1]);
        const jobData = Array.isArray(schema)
          ? schema.find((s) => s["@type"] === "JobPosting")
          : schema["@type"] === "JobPosting"
          ? schema
          : null;

        if (jobData) {
          const descRaw = jobData.description || "";
          const descClean = cleanText(descRaw);
          const bullets = cleanBullets(descRaw);

          const logo =
            jobData.hiringOrganization?.logo ||
            jobData.image ||
            baseJob.company_logo;

          const address =
            jobData.jobLocation?.address?.streetAddress ||
            jobData.jobLocation?.address?.addressLocality ||
            baseJob.address_detail;

          return {
            ...baseJob,
            company_logo: logo || baseJob.company_logo,
            description: descClean.length > 100 ? descClean : baseJob.description,
            description_sections: parseDescriptionSections(descClean),
            description_items: bullets.length > 0 ? bullets : baseJob.description_items,
            address_detail: address,
            other_info: {
              ...baseJob.other_info,
              work_type: jobData.employmentType || "Toàn thời gian",
            },
          };
        }
      } catch {
        // Fallback
      }
    }

    return baseJob;
  } catch (err) {
    return baseJob;
  }
}

/**
 * MASTER ENRICHMENT FUNCTION
 * Automatically determines platform and extracts 100% full detail from original page
 */
export async function enrichJobDetail(job: JobListing): Promise<JobListing> {
  // Check cache
  const cacheKey = `${job.source_platform}_${job.id}_${job.source_job_id}`;
  if (detailCache.has(cacheKey)) {
    return detailCache.get(cacheKey)!;
  }

  let enriched: JobListing = { ...job };

  // If CareerLink
  if (
    job.source_platform === "CAREERLINK" ||
    job.source_url.includes("careerlink.vn")
  ) {
    enriched = await scrapeCareerLinkDetail(job.source_url, job);
  }
  // If TopCV
  else if (
    job.source_platform === "TOPCV" ||
    job.source_url.includes("topcv.vn")
  ) {
    enriched = await scrapeTopCvDetail(job.source_url, job);
  }
  // Other platforms
  else if (job.source_url && job.source_url.startsWith("http")) {
    enriched = await scrapeGenericDetail(job.source_url, job);
  }

  // Save to cache
  detailCache.set(cacheKey, enriched);
  detailCache.set(job.id, enriched);

  return enriched;
}
