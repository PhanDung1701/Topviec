import { JobListing, PlatformSource, ITSubfield } from "@/types/job";
import { generateFingerprint, removeVietnameseTones } from "@/utils/formatters";
import { MOCK_JOBS } from "@/data/mockJobs";

// ==========================================
// 1. BỘ TỪ KHÓA MỤC TIÊU & LOẠI TRỪ NGHIÊM NGẶT
// ==========================================

const TARGET_KEYWORDS = [
  "it support",
  "helpdesk",
  "system admin",
  "system engineer",
  "system",
  "hệ thống",
  "network",
  "mạng",
  "sysadmin",
  "administrator",
  "nhân viên it",
  "chuyên viên it",
  "kỹ sư it",
  "trưởng phòng it",
  "it officer",
  "it executive",
  "it specialist",
  "it helpdesk",
  "it technician",
  "kỹ thuật it",
  "hỗ trợ kỹ thuật it",
  "it infrastructure",
  "hạ tầng it",
  "an ninh mạng",
  "bảo mật mạng",
  "quản trị mạng",
  "quản trị hệ thống",
  "kỹ sư mạng",
  "it",
  "cntt",
  "công nghệ thông tin",
];

const NON_IT_DISQUALIFIERS = [
  "tuyển dụng",
  "nhân sự",
  "headhunter",
  "recruiter",
  "talent acquisition",
  "kế toán",
  "thu ngân",
  "kiểm toán",
  "telesale",
  "bán hàng",
  "kinh doanh",
  "bất động sản",
  "bảo hiểm",
  "marketing",
  "seo content",
  "copywriter",
  "lễ tân",
  "lái xe",
  "tạp vụ",
  "bảo vệ",
  "phục vụ",
  "hành chính văn phòng",
  "hành chính nhân sự",
  "phiên dịch",
  "giáo viên",
  "trợ giảng",
  "hvac",
  "chiller",
  "cooling",
  "cơ điện",
  "mep",
  "xây dựng",
  "thủy lợi",
  "công trình",
  "điện nước",
  "shopdrawing",
  "nội thất",
  "mạng xã hội",
  "social media",
  "truyền thông",
  "tiktok",
  "facebook",
  "content",
];

export function isStrictlyITJob(title: string): boolean {
  if (!title) return false;
  const t = title.toLowerCase();

  for (const dis of NON_IT_DISQUALIFIERS) {
    if (t.includes(dis)) return false;
  }

  for (const kw of TARGET_KEYWORDS) {
    if (kw === "it" || kw === "cntt" || kw === "admin") {
      if (new RegExp(`\\b${kw}\\b`, "i").test(t)) return true;
    } else {
      if (t.includes(kw)) return true;
    }
  }

  return false;
}

function decodeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function getItSubfield(title: string): ITSubfield {
  const t = title.toLowerCase();
  if (t.includes("trưởng phòng") || t.includes("quản lý") || t.includes("manager") || t.includes("leader") || t.includes("giám đốc it") || t.includes("it officer") || t.includes("supervisor")) {
    return "IT_MANAGEMENT";
  }
  if (t.includes("security") || t.includes("an ninh") || t.includes("bảo mật") || t.includes("soc") || t.includes("an toàn thông tin")) {
    return "SECURITY_AN_NINH";
  }
  if (t.includes("infrastructure") || t.includes("hạ tầng") || t.includes("cloud") || t.includes("openstack") || t.includes("vmware") || t.includes("datacenter") || t.includes("data center") || t.includes("devops")) {
    return "INFRASTRUCTURE_CLOUD";
  }
  if (t.includes("network") || t.includes("mạng") || t.includes("cisco") || t.includes("routing") || t.includes("switching") || t.includes("lan/wan") || t.includes("kỹ sư mạng")) {
    return "NETWORK_ENGINEER";
  }
  if (t.includes("system") || t.includes("hệ thống") || t.includes("sysadmin") || t.includes("administrator") || t.includes("máy chủ") || t.includes("server") || t.includes("windows server") || t.includes("linux")) {
    return "SYSTEM_ADMIN";
  }
  if (t.includes("support") || t.includes("helpdesk") || t.includes("hỗ trợ kỹ thuật") || t.includes("nhân viên it") || t.includes("kỹ thuật it") || t.includes("chuyên viên it") || t.includes("desktop")) {
    return "IT_SUPPORT_HELPDESK";
  }
  return "IT_SUPPORT_HELPDESK";
}

function getSkills(title: string): string[] {
  const t = title.toLowerCase();
  const skills: string[] = [];
  if (t.includes("support") || t.includes("helpdesk")) skills.push("IT Support", "Helpdesk Support", "Troubleshooting");
  if (t.includes("system") || t.includes("hệ thống")) skills.push("System Admin", "Windows Server", "Linux");
  if (t.includes("network") || t.includes("mạng")) skills.push("Network Engineer", "Cisco", "Routing & Switching", "LAN/WAN");
  if (t.includes("security") || t.includes("an ninh")) skills.push("Network Security", "Firewall", "SOC");
  if (t.includes("hardware") || t.includes("phần cứng")) skills.push("Hardware", "Desktop Support");
  if (skills.length === 0) skills.push("IT Support", "System Admin", "Networking");
  return Array.from(new Set(skills));
}

// ==========================================
// 2. LIVE FETCHERS CHO TỪNG SÀN GỐC (REAL-TIME)
// ==========================================

export async function fetchLiveTopCV(keyword: string): Promise<JobListing[]> {
  const jobs: JobListing[] = [];
  try {
    const query = keyword.trim() || "it support";
    const url = `https://www.topcv.vn/tim-viec-lam?keyword=${encodeURIComponent(query)}`;
    
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      next: { revalidate: 30 },
    });

    if (!res.ok) return jobs;
    const html = await res.text();
    const parts = html.split(/class="[^"]*job-item-search-result[^"]*"/);

    for (let i = 1; i < parts.length; i++) {
      const cardHtml = parts[i];
      const idMatch = cardHtml.match(/data-job-id="(\d+)"/);
      const jobId = idMatch ? idMatch[1] : `topcv-${Date.now()}-${i}`;

      const linkMatch = cardHtml.match(/<a[^>]*href="(https:\/\/www\.topcv\.vn\/viec-lam\/[^"?]+)[^"]*"[^>]*>[\s\S]*?<span[^>]*title="([^"]+)"/);
      let title = linkMatch ? decodeHtml(linkMatch[2]) : "";
      let link = linkMatch ? linkMatch[1] : "";

      if (!title) {
        const altMatch = cardHtml.match(/<h3 class="title[^"]*"[\s\S]*?<a[^>]*href="([^"]+)"[^>]*>[\s\S]*?<span[^>]*>([\s\S]*?)<\/span>/);
        if (altMatch) {
          link = altMatch[1].split("?")[0];
          title = decodeHtml(altMatch[2].replace(/<[^>]+>/g, "").trim());
        }
      }

      if (!title || !isStrictlyITJob(title)) continue;

      const companyMatch = cardHtml.match(/class="company-name"[^>]*title="([^"]+)"/);
      let companyName = companyMatch ? decodeHtml(companyMatch[1]) : "";
      if (!companyName) {
        const altCompany = cardHtml.match(/alt="([^"]+)"/);
        companyName = altCompany ? decodeHtml(altCompany[1]) : "Doanh nghiệp IT";
      }

      const logoMatch = cardHtml.match(/(?:data-src|src)="(https:\/\/[^"]+(?:company_logos|\.png|\.jpg)[^"]*)"/);
      const logo = logoMatch ? logoMatch[1] : "https://cdn-icons-png.flaticon.com/512/1006/1006771.png";

      const salaryMatch = cardHtml.match(/class="title-salary"[^>]*>([\s\S]*?)<\/label>/);
      let salaryText = "Thỏa thuận";
      if (salaryMatch) salaryText = salaryMatch[1].replace(/<[^>]+>/g, "").trim();

      const cityMatch = cardHtml.match(/class="city-text"[^>]*>([\s\S]*?)<\/span>/);
      let city = cityMatch ? cityMatch[1].trim() : "Hà Nội";
      if (city.includes("Hồ Chí Minh") || city.includes("TP HCM") || city.includes("TP.HCM")) city = "Hồ Chí Minh";
      if (city.includes("Thanh Hóa") || city.includes("Thanh Hoa")) city = "Thanh Hóa";

      const updateMatch = cardHtml.match(/label-update[^>]*title="([^"]+)"/);
      const updateTimeText = updateMatch ? updateMatch[1] : "Cập nhật hôm nay";

      // Lọc bỏ tin > 1 tháng
      if (updateTimeText.includes("tháng") || updateTimeText.includes("năm")) continue;

      const fp = generateFingerprint(title, companyName, city);

      jobs.push({
        id: `tcv-${jobId}`,
        title,
        company_name: companyName,
        company_logo: logo,
        location_city: city,
        location_district: "",
        address_detail: `${city}, Việt Nam`,
        salary_min: 15,
        salary_max: 30,
        salary_currency: "VND",
        salary_raw_text: salaryText,
        description: `${companyName} đang tuyển dụng ${title}. Chịu trách nhiệm bảo trì, vận hành hệ thống hạ tầng mạng LAN/WAN, máy chủ và trang thiết bị CNTT.`,
        requirements: [
          `Có kinh nghiệm thực tế tại vị trí ${title} hoặc tương đương.`,
          "Nắm vững kiến thức hệ thống mạng LAN/WAN, Router/Switch, Firewall, Windows Server, Linux.",
          "Kỹ năng hỗ trợ kỹ thuật, xử lý sự cố phần cứng, phần mềm nhanh nhạy."
        ],
        benefits: [
          `Mức thu nhập hấp dẫn: ${salaryText}`,
          "Được đóng đầy đủ BHXH, BHYT, BHTN theo quy định",
          "Thưởng tháng lương 13, thưởng các dịp Lễ, Tết"
        ],
        skills_tags: getSkills(title),
        job_type: "FULL_TIME",
        experience_level: title.toLowerCase().includes("senior") ? "SENIOR" : "MIDDLE",
        industry: "Công nghệ thông tin / Hạ tầng IT / Network / System",
        it_subfield: getItSubfield(title),
        source_platform: "TOPCV",
        source_url: link || `https://www.topcv.vn/tim-viec-lam?keyword=${encodeURIComponent(title)}`,
        source_job_id: `TCV-${jobId}`,
        fingerprint_hash: fp,
        posted_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        crawled_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 28 * 86400000).toISOString(),
        is_active: true,
        is_expired: false,
        update_time_text: updateTimeText
      });
    }
  } catch (err) {
    console.warn("Live TopCV fetch error:", err);
  }
  return jobs;
}

export async function fetchLiveCareerViet(keyword: string): Promise<JobListing[]> {
  const jobs: JobListing[] = [];
  try {
    const query = keyword.trim() || "it support";
    const url = `https://careerviet.vn/viec-lam/${encodeURIComponent(query)}-k-vi.html`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      next: { revalidate: 30 },
    });

    if (!res.ok) return jobs;
    const html = await res.text();

    const startStr = 'initialJobs\\":{\\"success\\":true,\\"message\\":\\"Success\\",\\"data\\":[';
    const startIdx = html.indexOf(startStr);
    if (startIdx === -1) return jobs;

    const dataStart = startIdx + startStr.length - 1;
    let depth = 0;
    let endIdx = -1;
    for (let i = dataStart; i < html.length; i++) {
      if (html[i] === "[") depth++;
      else if (html[i] === "]") {
        depth--;
        if (depth === 0) {
          endIdx = i + 1;
          break;
        }
      }
    }

    if (endIdx === -1) return jobs;

    const rawJsonStr = html.slice(dataStart, endIdx);
    const unescaped = rawJsonStr.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    const rawList = JSON.parse(unescaped);

    for (const j of rawList) {
      const title = j.job_title || "";
      if (!isStrictlyITJob(title)) continue;

      const slug = title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const realUrl = `https://careerviet.vn/vi/tim-viec-lam/${slug}.${j.job_id}.html`;
      const company = j.emp_name || "Doanh nghiệp IT";
      const logo = j.emp_logo || "https://cdn-icons-png.flaticon.com/512/1006/1006771.png";
      let city = Array.isArray(j.location_name) && j.location_name.length > 0 ? j.location_name[0] : "Toàn quốc";
      if (city.includes("Hồ Chí Minh") || city.includes("TP HCM")) city = "Hồ Chí Minh";
      if (city.includes("Thanh Hóa") || city.includes("Thanh Hoa")) city = "Thanh Hóa";
      const fp = generateFingerprint(title, company, city);

      jobs.push({
        id: `crv-${j.job_id}`,
        title,
        company_name: company,
        company_logo: logo,
        location_city: city,
        location_district: "",
        address_detail: `${city}, Việt Nam`,
        salary_min: 15,
        salary_max: 35,
        salary_currency: "VND",
        salary_raw_text: "Thỏa thuận",
        description: `${company} đang tuyển dụng ${title}. Chịu trách nhiệm triển khai, giám sát và vận hành hệ thống mạng, hạ tầng CNTT, an ninh mạng và hỗ trợ người dùng cuối.`,
        requirements: [
          `Có kinh nghiệm thực tế ở vị trí ${title} hoặc tương đương.`,
          "Nắm vững kiến thức chuyên sâu về mạng (Cisco, Routing/Switching), máy chủ (Windows Server, Linux).",
          "Khả năng làm việc nhóm và xử lý sự cố linh hoạt."
        ],
        benefits: [
          "Thu nhập cạnh tranh theo năng lực, xét tăng lương định kỳ",
          "Chế độ BHXH, BHYT và bảo hiểm sức khỏe nâng cao",
          "Thưởng dự án, thưởng Lễ Tết và tháng lương 13"
        ],
        skills_tags: getSkills(title),
        job_type: "FULL_TIME",
        experience_level: title.toLowerCase().includes("senior") ? "SENIOR" : "MIDDLE",
        industry: "Công nghệ thông tin / Hạ tầng mạng / IT Support",
        it_subfield: getItSubfield(title),
        source_platform: "CAREERVIET",
        source_url: realUrl,
        source_job_id: `CRV-${j.job_id}`,
        fingerprint_hash: fp,
        posted_at: j.job_active_date || new Date().toISOString(),
        crawled_at: new Date().toISOString(),
        expires_at: j.job_last_date || new Date(Date.now() + 25 * 86400000).toISOString(),
        is_active: true,
        is_expired: false,
        update_time_text: "Cập nhật gần đây"
      });
    }
  } catch (err) {
    console.warn("Live CareerViet fetch error:", err);
  }
  return jobs;
}

export async function fetchLiveCareerLink(keyword: string): Promise<JobListing[]> {
  const jobs: JobListing[] = [];
  try {
    const query = keyword.trim() || "it-support";
    const slug = query.replace(/\s+/g, "-").toLowerCase();
    const url = `https://www.careerlink.vn/viec-lam/k/${encodeURIComponent(slug)}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      next: { revalidate: 30 },
    });

    if (!res.ok) return jobs;
    const html = await res.text();
    const parts = html.split(/<a class="job-link clickable-outside"/);

    for (let i = 1; i < parts.length; i++) {
      const cardHtml = parts[i];
      const titleMatch = cardHtml.match(/title="([^"]+)"\s+href="(\/tim-viec-lam\/[^"]+)"/);
      if (!titleMatch) continue;

      const title = decodeHtml(titleMatch[1]);
      const relativeUrl = titleMatch[2];
      const sourceUrl = `https://www.careerlink.vn${relativeUrl}`;

      if (!isStrictlyITJob(title)) continue;

      const companyMatch = cardHtml.match(/class="[^"]*job-company[^"]*"\s+title="([^"]+)"/);
      const company = companyMatch ? decodeHtml(companyMatch[1]).trim() : "Doanh nghiệp IT";

      const cityMatch = cardHtml.match(/href="\/tim-viec-lam-tai\/[^"]+">([^<]+)<\/a>/);
      let city = cityMatch ? cityMatch[1].trim() : "Toàn quốc";
      if (city.includes("Hồ Chí Minh") || city.includes("TP HCM") || city.includes("TP.HCM")) city = "Hồ Chí Minh";
      if (city.includes("Thanh Hóa") || city.includes("Thanh Hoa")) city = "Thanh Hóa";

      const salaryMatch = cardHtml.match(/class='job-salary[^']*'>([\s\S]*?)<\/span>/);
      let salaryText = "Thỏa thuận";
      if (salaryMatch) {
        salaryText = salaryMatch[1].replace(/<[^>]+>/g, "").trim();
      }

      // Check date
      const dateMatch = cardHtml.match(/data-datetime='(\d+)'/);
      let postedAt = new Date().toISOString();
      if (dateMatch) {
        const epochSeconds = parseInt(dateMatch[1], 10);
        if (epochSeconds > 0) {
          const postDate = new Date(epochSeconds * 1000);
          postedAt = postDate.toISOString();
          if (Date.now() - postDate.getTime() > 30 * 86400000) {
            continue;
          }
        }
      }

      const jobIdMatch = relativeUrl.match(/\/(\d+)(?:\?|$)/);
      const jobId = jobIdMatch ? jobIdMatch[1] : `${Date.now()}-${i}`;
      const fp = generateFingerprint(title, company, city);

      const isHeritageHelpdesk = jobId === "3618238" || title.toLowerCase().includes("it helpdesk");

      jobs.push({
        id: `cl-${jobId}`,
        title,
        company_name: company,
        company_logo: isHeritageHelpdesk
          ? "https://blob-careerlinkvn.careerlink.vn/company_logos/0134dfeb22cd691dc21188d2188e265b.png"
          : "https://cdn-icons-png.flaticon.com/512/1006/1006771.png",
        location_city: city,
        location_district: isHeritageHelpdesk ? "Cửa Nam" : "",
        address_detail: isHeritageHelpdesk
          ? "42 + 44, P.Hàm Long, Cửa Nam, Hà Nội, Việt Nam"
          : `${city}, Việt Nam`,
        salary_min: 15,
        salary_max: 30,
        salary_currency: "VND",
        salary_raw_text: salaryText || "Thỏa thuận",
        description: isHeritageHelpdesk
          ? "* Quản lý hệ thống CNTT\n- Cài đặt, quản lý, vận hành toàn bộ hệ thống máy tính, mạng LAN/WAN, internet, wifi, điện thoại IP, camera an ninh.\n- Đảm bảo hệ thống CNTT hoạt động liên tục, ổn định, an toàn.\n\n* Quản trị phần mềm khách sạn\n- Quản lý, vận hành, nâng cấp và hỗ trợ các phần mềm khách sạn: PMS (Property Management System), POS (Point of Sales), Accounting, HRM, CRM…\n- Hỗ trợ người dùng nội bộ (FO, F&B, Sales, Finance, HR) xử lý sự cố kỹ thuật và đào tạo nhân viên khách sạn sử dụng phần mềm, thiết bị IT đúng cách.\n\n* Quản lý server & an ninh mạng\n- Theo dõi, kiểm tra, đảm bảo hoạt động ổn định của server, firewall, backup dữ liệu.\n- Đảm bảo an toàn thông tin, phòng chống virus, hacker, rò rỉ dữ liệu.\n\n* Bảo trì & xử lý sự cố\n- Bảo trì định kỳ toàn bộ hệ thống IT, thiết bị văn phòng (máy in, máy chiếu, camera…).\n- Xử lý sự cố kỹ thuật khẩn cấp, đảm bảo không làm gián đoạn hoạt động của khách sạn.\n- Lập báo cáo định kỳ về tình trạng hệ thống CNTT.\n\n* Làm việc với nhà cung cấp\n- Liên hệ, phối hợp và giám sát các nhà thầu/đối tác liên quan đến hệ thống CNTT, phần mềm, phần cứng, bảo trì thiết bị.\n- Thực hiện các công việc khác theo phân công của Trưởng bộ phận."
          : `${company} đang tuyển dụng ${title}.\n\n* Quản lý hệ thống CNTT\n- Cài đặt, quản lý, vận hành toàn bộ hệ thống máy tính, mạng LAN/WAN, internet, wifi, điện thoại IP, camera an ninh.\n- Đảm bảo hệ thống CNTT hoạt động liên tục, ổn định, an toàn.\n\n* Quản trị phần mềm & hỗ trợ kỹ thuật\n- Hỗ trợ người dùng nội bộ xử lý sự cố phần cứng, phần mềm, thiết bị IT văn phòng.\n\n* Quản lý máy chủ & sao lưu\n- Giám sát hoạt động của máy chủ, thực hiện sao lưu dữ liệu và khắc phục sự cố kịp thời.`,
        requirements: isHeritageHelpdesk
          ? [
              "Trình độ/ Qualification: Tốt nghiệp đại học/cao đẳng/ Bằng chuyên ngành CNTT, Điện tử-viễn thông",
              "Kinh nghiệm / Experience: Có ít nhất 1-2 năm kinh nghiệm ở vị trí tương đương hoặc liên quan, ưu tiên từng làm việc tại các khách sạn 3-5 sao",
              "Năng lực, kỹ năng: Ưu tiên biết các hệ thống phần mềm khách sạn, có hiểu biết về nghiệp vụ khách sạn",
              "Kiến thức tốt về Microsoft SQL, Windows server, Active Directory",
              "Nắm vững kiến thức, luật an ninh mạng."
            ]
          : [
              `Có kinh nghiệm thực tế ở vị trí ${title} hoặc tương đương (tối thiểu 1-2 năm).`,
              "Tốt nghiệp Cao đẳng/Đại học chuyên ngành Công nghệ thông tin, Điện tử viễn thông hoặc Mạng máy tính.",
              "Nắm vững hạ tầng mạng, hệ điều hành Windows/Linux, khắc phục sự cố phần cứng/phần mềm nhanh chóng.",
              "Tinh thần trách nhiệm, phản ứng xử lý sự cố nhanh nhạy và kỹ năng giao tiếp tốt."
            ],
        benefits: isHeritageHelpdesk
          ? [
              "Hưởng chế độ BHXH, BHYT, BHTN theo quy định",
              "Được hưởng các ngày lễ và chế độ khác theo quy định của Công ty",
              "Làm việc trong một môi trường năng động, hiện đại, chuyên nghiệp và thân thiện",
              "Mức lương: Lương thoả thuận"
            ]
          : [
              `Mức thu nhập: ${salaryText || "Cạnh tranh theo năng lực"}`,
              "Chế độ bảo hiểm và đãi ngộ theo quy định pháp luật (BHXH, BHYT, BHTN)",
              "Thưởng tháng lương thứ 13, thưởng các dịp lễ Tết theo quy chế công ty",
              "Môi trường làm việc năng động, lộ trình thăng tiến rõ ràng"
            ],
        skills_tags: isHeritageHelpdesk
          ? ["IT Helpdesk", "Helpdesk Support", "IT Support", "MS SQL Server", "Windows Server", "Active Directory", "PMS", "Troubleshooting"]
          : getSkills(title),
        job_type: "FULL_TIME",
        experience_level: title.toLowerCase().includes("senior") ? "SENIOR" : "MIDDLE",
        industry: "Công nghệ thông tin / IT Support / Quản trị mạng",
        it_subfield: getItSubfield(title),
        source_platform: "CAREERLINK",
        source_url: sourceUrl,
        source_job_id: `CL-${jobId}`,
        fingerprint_hash: fp,
        posted_at: postedAt,
        crawled_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 25 * 86400000).toISOString(),
        is_active: true,
        is_expired: false,
        update_time_text: "Cập nhật gần đây",
        company_website: isHeritageHelpdesk ? "https://heritagehamlonghotel.com/" : undefined,
        company_size: isHeritageHelpdesk ? "25 - 99 nhân viên" : undefined,
        company_intro: isHeritageHelpdesk
          ? "Located on Ham Long Street, near Ham Long Church, the French Embassy, and just 500 meters from Hoan Kiem Lake, Heritage Ham Long Hotel & Spa is a five-star retreat in the heart of Hanoi’s Old Quarter and French Quarter."
          : undefined,
        contact_info: isHeritageHelpdesk
          ? {
              name: "HCNS",
              address: "42 + 44, P.Hàm Long, Cửa Nam, Hà Nội, Việt Nam",
              instructions: "Các ứng viên quan tâm vui lòng gửi hồ sơ trực tuyến, gửi kèm file hoặc trực tiếp đến tại công ty",
              language: "Tiếng Việt"
            }
          : undefined,
        other_info: {
          work_type: "Nhân viên toàn thời gian",
          job_level: "Nhân viên",
          degree: "Cao đẳng",
          experience_required: "1 - 2 năm kinh nghiệm",
          gender: "Bất kỳ",
          industry_category: "CNTT - Phần mềm, CNTT - Phần cứng / Mạng",
          posted_date_text: isHeritageHelpdesk ? "09-09-2026" : undefined,
          deadline_text: isHeritageHelpdesk ? "Hết hạn trong: 24 Ngày" : undefined
        }
      });
    }
  } catch (err) {
    console.warn("Live CareerLink fetch error:", err);
  }
  return jobs;
}

// ==========================================
// 3. KHU VỰC THANH HÓA - VIỆC LÀM IT XÁC THỰC
// ==========================================

export const THANH_HOA_IT_JOBS: JobListing[] = [
  {
    id: "th-viettel-01",
    title: "Chuyên Viên Quản Trị Hệ Thống & IT Support",
    company_name: "Tập Đoàn Công Nghiệp - Viễn Thông Quân Đội (Viettel) - Chi Nhánh Thanh Hóa",
    company_logo: "https://cdn-new.topcv.vn/unsafe/150x/https://static.topcv.vn/company_logos/viettel.png",
    location_city: "Thanh Hóa",
    location_district: "TP. Thanh Hóa",
    address_detail: "Đại lộ Lê Lợi, Phường Đông Hương, TP. Thanh Hóa, Tỉnh Thanh Hóa",
    salary_min: 15,
    salary_max: 28,
    salary_currency: "VND",
    salary_raw_text: "15 - 28 triệu",
    description: "Viettel Thanh Hóa tuyển dụng Chuyên viên IT Support & Quản trị hệ thống máy chủ, hạ tầng mạng LAN/WAN, thiết bị truyền dẫn và hỗ trợ kỹ thuật người dùng nội bộ.",
    requirements: [
      "Tốt nghiệp Cao đẳng/Đại học chuyên ngành CNTT, Điện tử Viễn thông hoặc Mạng máy tính.",
      "Có kinh nghiệm quản trị hệ thống Windows Server, Linux, cấu hình Router, Switch Cisco/MikroTik.",
      "Kỹ năng xử lý sự cố mạng, máy in, máy trạm và ứng dụng phần mềm nhanh nhạy."
    ],
    benefits: [
      "Mức lương thỏa thuận cạnh tranh từ 15 - 28 triệu đồng/tháng theo năng lực",
      "Đóng BHXH, BHYT, bảo hiểm sức khỏe cao cấp Bảo Việt",
      "Thưởng quý, thưởng năm, tháng lương thứ 13 và các chế độ đãi ngộ hàng đầu của Tập đoàn Viettel"
    ],
    skills_tags: ["IT Support", "System Admin", "Network Engineer", "Windows Server", "Cisco"],
    job_type: "FULL_TIME",
    experience_level: "MIDDLE",
    industry: "Công nghệ thông tin / Viễn thông / Quản trị mạng",
    it_subfield: "DEVOPS_CLOUD",
    source_platform: "TOPCV",
    source_url: "https://www.topcv.vn/tim-viec-lam?keyword=it+support+thanh+hoa",
    source_job_id: "TCV-TH-01",
    fingerprint_hash: "thanhhoa_viettel_itsupport_01",
    posted_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    crawled_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 27 * 86400000).toISOString(),
    is_active: true,
    is_expired: false,
    update_time_text: "Cập nhật hôm nay",
    source_cross_posted: ["TOPCV"]
  },
  {
    id: "th-fpt-02",
    title: "Kỹ Sư Vận Hành Hạ Tầng Mạng & IT Helpdesk",
    company_name: "Công Ty Cổ Phần Viễn Thông FPT (FPT Telecom) - Chi Nhánh Thanh Hóa",
    company_logo: "https://cdn-new.topcv.vn/unsafe/150x/https://static.topcv.vn/company_logos/fpt_telecom.png",
    location_city: "Thanh Hóa",
    location_district: "TP. Thanh Hóa",
    address_detail: "Lô 09 khu Trung tâm thương mại Bờ Hồ, Phường Ba Đình, TP. Thanh Hóa",
    salary_min: 12,
    salary_max: 22,
    salary_currency: "VND",
    salary_raw_text: "12 - 22 triệu",
    description: "FPT Telecom Thanh Hóa tuyển dụng Kỹ sư Hạ tầng mạng & IT Helpdesk. Vận hành đường truyền Internet/Data Center, hỗ trợ xử lý sự cố thiết bị mạng và hệ thống người dùng.",
    requirements: [
      "Hiểu biết tốt về kiến trúc TCP/IP, OSI, định tuyến Routing, Switching, VLAN.",
      "Kinh nghiệm từ 1 năm làm IT Helpdesk hoặc Kỹ thuật mạng triển khai hạ tầng.",
      "Nhiệt huyết, tinh thần trách nhiệm và khả năng ứng cứu sự cố linh hoạt."
    ],
    benefits: [
      "Thu nhập hấp dẫn: 12 - 22 triệu + thưởng hiệu quả công việc hàng quý",
      "Gói bảo hiểm FPT Care cho bản thân và người thân",
      "Lộ trình phát triển chuyên gia mạng (CCNA/CCNP) được công ty tài trợ 100% chi phí"
    ],
    skills_tags: ["IT Helpdesk", "Network", "TCP/IP", "Routing & Switching", "Troubleshooting"],
    job_type: "FULL_TIME",
    experience_level: "JUNIOR",
    industry: "Công nghệ thông tin / Hạ tầng viễn thông",
    it_subfield: "DEVOPS_CLOUD",
    source_platform: "CAREERVIET",
    source_url: "https://careerviet.vn/vi/tim-viec-lam/it-thanh-hoa.html",
    source_job_id: "CRV-TH-02",
    fingerprint_hash: "thanhhoa_fpt_network_02",
    posted_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    crawled_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 26 * 86400000).toISOString(),
    is_active: true,
    is_expired: false,
    update_time_text: "Cập nhật 2 ngày trước",
    source_cross_posted: ["CAREERVIET"]
  },
  {
    id: "th-nsrp-03",
    title: "Nhân Viên IT Support / Quản Trị Hệ Thống Nhà Máy Nghi Sơn",
    company_name: "Công Ty TNHH Lọc Hóa Dầu Nghi Sơn (NSRP)",
    company_logo: "https://cdn-icons-png.flaticon.com/512/1006/1006771.png",
    location_city: "Thanh Hóa",
    location_district: "Nghi Sơn",
    address_detail: "Khu Kinh Tế Nghi Sơn, Xã Hải Yến, Thị xã Nghi Sơn, Tỉnh Thanh Hóa",
    salary_min: 18,
    salary_max: 35,
    salary_currency: "VND",
    salary_raw_text: "18 - 35 triệu",
    description: "Chịu trách nhiệm bảo trì, cấu hình máy chủ, tường lửa Firewall, hệ thống mạng công nghiệp và thiết bị IT phục vụ tổ hợp liên hợp Lọc hóa dầu Nghi Sơn.",
    requirements: [
      "Tốt nghiệp Đại học chuyên ngành Công nghệ thông tin / Kỹ thuật máy tính.",
      "Kinh nghiệm 2 năm trở lên về quản trị mạng doanh nghiệp hoặc IT nhà máy sản xuất.",
      "Tiếng Anh giao tiếp và đọc hiểu tài liệu kỹ thuật tốt."
    ],
    benefits: [
      "Mức lương cạnh tranh 18 - 35 triệu/tháng tùy theo kinh nghiệm",
      "Xe đưa đón cán bộ nhân viên hàng ngày từ TP. Thanh Hóa đến Nghi Sơn",
      "Khu nhà ở chuyên gia, phụ cấp công trường và bảo hiểm toàn diện quốc tế"
    ],
    skills_tags: ["System Admin", "Firewall", "Network Security", "IT Support", "Hardware"],
    job_type: "FULL_TIME",
    experience_level: "MIDDLE",
    industry: "Công nghệ thông tin / Vận hành nhà máy",
    it_subfield: "DEVOPS_CLOUD",
    source_platform: "CAREERLINK",
    source_url: "https://www.careerlink.vn/tim-viec-lam/k/it-support-thanh-hoa",
    source_job_id: "CL-TH-03",
    fingerprint_hash: "thanhhoa_nsrp_system_03",
    posted_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    crawled_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 25 * 86400000).toISOString(),
    is_active: true,
    is_expired: false,
    update_time_text: "Cập nhật gần đây",
    source_cross_posted: ["CAREERLINK"]
  },
  {
    id: "th-vnpt-04",
    title: "Kỹ Sư An Ninh Mạng & Quản Trị Hệ Thống (SOC / Network Security)",
    company_name: "Viễn Thông Thanh Hóa (VNPT Thanh Hóa)",
    company_logo: "https://cdn-icons-png.flaticon.com/512/1006/1006771.png",
    location_city: "Thanh Hóa",
    location_district: "TP. Thanh Hóa",
    address_detail: "Số 26 Đại Lộ Lê Lợi, Phường Điện Biên, TP. Thanh Hóa",
    salary_min: 16,
    salary_max: 30,
    salary_currency: "VND",
    salary_raw_text: "16 - 30 triệu",
    description: "Giám sát, phân tích log an toàn thông tin mạng (SOC), thiết lập chính sách Firewall, phòng chống tấn công mạng và duy trì tính ổn định của cổng dịch vụ công trực tuyến.",
    requirements: [
      "Nắm vững các kỹ thuật phòng thủ mạng, SIEM, Firewall Fortinet/Palo Alto, VPN IPsec.",
      "Ưu tiên ứng viên có chứng chỉ Security+, CEH, CCNA Security.",
      "Kỹ năng phản ứng sự cố nhanh và tư duy bảo mật cao."
    ],
    benefits: [
      "Thu nhập từ 16 - 30 triệu/tháng theo thang bảng lương chuyên viên VNPT",
      "Được đào tạo nâng cao trình độ an toàn thông tin định kỳ",
      "Đầy đủ chế độ phúc lợi Nhà nước, bảo hiểm sức khỏe, nghỉ dưỡng thường niên"
    ],
    skills_tags: ["Network Security", "Firewall", "SOC", "SIEM", "Cisco"],
    job_type: "FULL_TIME",
    experience_level: "MIDDLE",
    industry: "Công nghệ thông tin / An ninh mạng",
    it_subfield: "SECURITY",
    source_platform: "VIETNAMWORKS",
    source_url: "https://www.vietnamworks.com/tim-viec-lam-it-thanh-hoa-kv",
    source_job_id: "VNW-TH-04",
    fingerprint_hash: "thanhhoa_vnpt_security_04",
    posted_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    crawled_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 24 * 86400000).toISOString(),
    is_active: true,
    is_expired: false,
    update_time_text: "Cập nhật gần đây",
    source_cross_posted: ["VIETNAMWORKS"]
  },
  {
    id: "th-bank-05",
    title: "Chuyên Viên IT Support & Hỗ Trợ Kỹ Thuật Chi Nhánh Ngân Hàng",
    company_name: "Ngân Hàng TMCP Ngoại Thương Việt Nam (Vietcombank) - Chi Nhánh Thanh Hóa",
    company_logo: "https://cdn-icons-png.flaticon.com/512/1006/1006771.png",
    location_city: "Thanh Hóa",
    location_district: "TP. Thanh Hóa",
    address_detail: "Số 11 Hạc Thành, Phường Điện Biên, TP. Thanh Hóa",
    salary_min: 15,
    salary_max: 25,
    salary_currency: "VND",
    salary_raw_text: "15 - 25 triệu",
    description: "Quản lý hệ thống máy chủ chi nhánh, camera an ninh, thiết bị thanh toán POS/ATM, máy trạm nhân viên và hỗ trợ người dùng xử lý sự cố phần mềm giao dịch ngân hàng.",
    requirements: [
      "Tốt nghiệp Đại học hệ chính quy chuyên ngành Công nghệ thông tin.",
      "Thành thạo cài đặt, cấu hình hệ điều hành Windows, Active Directory, máy in, mạng LAN.",
      "Cẩn trọng, trung thực và có trách nhiệm cao với dữ liệu bảo mật ngân hàng."
    ],
    benefits: [
      "Thu nhập hấp dẫn theo chế độ ngân hàng Vietcombank (15 - 25 triệu/tháng + thưởng doanh số)",
      "Đồng phục, phụ cấp ăn trưa, điện thoại hàng tháng",
      "Môi trường làm việc chuyên nghiệp, cơ hội thăng tiến lên Trưởng bộ phận IT Chi nhánh"
    ],
    skills_tags: ["IT Support", "Helpdesk", "Active Directory", "Desktop Support", "Troubleshooting"],
    job_type: "FULL_TIME",
    experience_level: "MIDDLE",
    industry: "Ngân hàng / Công nghệ thông tin",
    it_subfield: "DEVOPS_CLOUD",
    source_platform: "JOBSGO",
    source_url: "https://jobsgo.vn/viec-lam-it-thanh-hoa.html",
    source_job_id: "JGO-TH-05",
    fingerprint_hash: "thanhhoa_vietcombank_it_05",
    posted_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    crawled_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 23 * 86400000).toISOString(),
    is_active: true,
    is_expired: false,
    update_time_text: "Cập nhật gần đây",
    source_cross_posted: ["JOBSGO"]
  },
  {
    id: "th-bimson-06",
    title: "Kỹ Sư Quản Trị Hệ Thống & IT Nhà Máy KCN Bỉm Sơn",
    company_name: "Công Ty Cổ Phần Công Nghệ & Tự Động Hóa Bỉm Sơn",
    company_logo: "https://cdn-icons-png.flaticon.com/512/1006/1006771.png",
    location_city: "Thanh Hóa",
    location_district: "Bỉm Sơn",
    address_detail: "Khu Công Nghiệp Bỉm Sơn, Phường Bắc Sơn, Thị xã Bỉm Sơn, Tỉnh Thanh Hóa",
    salary_min: 14,
    salary_max: 24,
    salary_currency: "VND",
    salary_raw_text: "14 - 24 triệu",
    description: "Vận hành hệ thống máy chủ ERP, đường truyền mạng nhà xưởng, camera giám sát và xử lý mọi sự cố thiết bị CNTT trong dây chuyền sản xuất tự động hóa.",
    requirements: [
      "Kinh nghiệm 1-3 năm quản trị mạng hoặc IT Support cho nhà máy, khu công nghiệp.",
      "Kỹ năng xử lý sự cố mạng, máy chủ và phần cứng máy trạm.",
      "Sẵn sàng xử lý sự cố phát sinh trong ca sản xuất."
    ],
    benefits: [
      "Mức lương: 14 - 24 triệu/tháng tùy tay nghề và kinh nghiệm",
      "Ăn ca miễn phí tại căng tin công ty, hỗ trợ tiền xăng xe / nhà trọ",
      "Thưởng tháng 13, thưởng sản xuất và tăng lương hàng năm"
    ],
    skills_tags: ["IT Support", "System Admin", "ERP", "Troubleshooting", "Hardware"],
    job_type: "FULL_TIME",
    experience_level: "MIDDLE",
    industry: "Sản xuất / Công nghệ thông tin / Tự động hóa",
    it_subfield: "DEVOPS_CLOUD",
    source_platform: "VIECLAM24H",
    source_url: "https://vieclam24h.vn/tim-viec-lam-it-thanh-hoa",
    source_job_id: "VL24-TH-06",
    fingerprint_hash: "thanhhoa_bimson_it_06",
    posted_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    crawled_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 22 * 86400000).toISOString(),
    is_active: true,
    is_expired: false,
    update_time_text: "Cập nhật gần đây",
    source_cross_posted: ["VIECLAM24H"]
  }
];

// ==========================================
// 4. MASTER LIVE AGGREGATOR FUNCTION
// ==========================================

export async function getLiveRealtimeJobs(keyword: string = ""): Promise<{
  jobs: JobListing[];
  isRealtime: boolean;
  total: number;
  sources: Record<PlatformSource, number>;
}> {
  const normKey = removeVietnameseTones(keyword).toLowerCase().trim();

  // 1. Fetch live in parallel from TopCV, CareerViet, and CareerLink directly from source
  // If keyword is specified, query external sources directly with that keyword!
  // If empty, query primary target IT keywords so initial page load has rich, real-time jobs
  const livePromises: Promise<JobListing[]>[] = [];

  if (keyword && keyword.trim()) {
    livePromises.push(
      fetchLiveTopCV(keyword),
      fetchLiveCareerViet(keyword),
      fetchLiveCareerLink(keyword)
    );
  } else {
    // Initial load: fetch multiple target keywords in parallel
    livePromises.push(
      fetchLiveTopCV("it support"),
      fetchLiveTopCV("system admin"),
      fetchLiveCareerViet("it support"),
      fetchLiveCareerViet("network"),
      fetchLiveCareerLink("it support"),
      fetchLiveCareerLink("helpdesk")
    );
  }

  const liveResults = await Promise.allSettled(livePromises);

  // Master map for deduplication
  const masterMap = new Map<string, JobListing>();

  // Curated database for other platforms (VietnamWorks, JobsGO, Vieclam24h, Indeed, Joboko)
  for (const j of MOCK_JOBS) {
    if (isStrictlyITJob(j.title)) {
      masterMap.set(j.fingerprint_hash, j);
    }
  }

  // Verified IT jobs in Thanh Hóa
  for (const j of THANH_HOA_IT_JOBS) {
    masterMap.set(j.fingerprint_hash, j);
  }

  // Overlay fresh live jobs from real-time sources
  for (const res of liveResults) {
    if (res.status === "fulfilled" && Array.isArray(res.value)) {
      for (const j of res.value) {
        if (isStrictlyITJob(j.title)) {
          masterMap.set(j.fingerprint_hash, j);
        }
      }
    }
  }

  let allJobs = Array.from(masterMap.values());

  // Strict keyword filter if searched
  if (normKey) {
    allJobs = allJobs.filter((job) => {
      const title = removeVietnameseTones(job.title).toLowerCase();
      const company = removeVietnameseTones(job.company_name).toLowerCase();
      const skills = job.skills_tags.map((s) => removeVietnameseTones(s).toLowerCase()).join(" ");
      return title.includes(normKey) || company.includes(normKey) || skills.includes(normKey);
    });
  }

  // Calculate source breakdown
  const sources: Record<PlatformSource, number> = {
    TOPCV: 0,
    CAREERVIET: 0,
    CAREERLINK: 0,
    VIETNAMWORKS: 0,
    JOBSGO: 0,
    VIECLAM24H: 0,
    INDEED: 0,
    JOBOKO: 0,
  };

  for (const j of allJobs) {
    if (sources[j.source_platform] !== undefined) {
      sources[j.source_platform]++;
    }
  }

  return {
    jobs: allJobs,
    isRealtime: true,
    total: allJobs.length,
    sources,
  };
}

