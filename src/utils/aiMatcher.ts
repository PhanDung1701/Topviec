import { JobListing, MatchAnalysis, UserCVProfile } from "@/types/job";
import { removeVietnameseTones } from "./formatters";

// Known comprehensive skills taxonomy
export const SKILLS_TAXONOMY: { name: string; aliases: string[]; category: string }[] = [
  // IT / Software
  { name: "React", aliases: ["reactjs", "react.js", "react"], category: "IT" },
  { name: "Next.js", aliases: ["nextjs", "next.js", "next 14", "next 15", "next"], category: "IT" },
  { name: "TypeScript", aliases: ["typescript", "ts"], category: "IT" },
  { name: "JavaScript", aliases: ["javascript", "js", "es6"], category: "IT" },
  { name: "Node.js", aliases: ["nodejs", "node.js", "node", "express", "nest", "nestjs"], category: "IT" },
  { name: "Python", aliases: ["python", "python3", "django", "fastapi", "flask"], category: "IT" },
  { name: "Java", aliases: ["java", "spring boot", "springboot", "hibernate"], category: "IT" },
  { name: "Golang", aliases: ["golang", "go"], category: "IT" },
  { name: "Docker", aliases: ["docker", "container", "dockerfile"], category: "IT" },
  { name: "Kubernetes", aliases: ["kubernetes", "k8s"], category: "IT" },
  { name: "AWS", aliases: ["aws", "amazon web services", "ec2", "s3", "lambda"], category: "IT" },
  { name: "GCP", aliases: ["gcp", "google cloud"], category: "IT" },
  { name: "SQL", aliases: ["sql", "mysql", "postgresql", "postgres", "sql server"], category: "IT" },
  { name: "MongoDB", aliases: ["mongodb", "mongo", "nosql"], category: "IT" },
  { name: "GraphQL", aliases: ["graphql", "apollo"], category: "IT" },
  { name: "Tailwind CSS", aliases: ["tailwind", "tailwindcss"], category: "IT" },
  { name: "Microservices", aliases: ["microservices", "microservice", "kien truc vi dich vu"], category: "IT" },
  { name: "Git", aliases: ["git", "github", "gitlab"], category: "IT" },
  { name: "CI/CD", aliases: ["ci/cd", "cicd", "github actions", "jenkins"], category: "IT" },
  { name: "Flutter", aliases: ["flutter", "dart"], category: "IT" },
  { name: "PyTorch", aliases: ["pytorch", "torch"], category: "IT" },
  { name: "TensorFlow", aliases: ["tensorflow", "keras"], category: "IT" },
  { name: "LLMs & AI", aliases: ["llm", "llms", "genai", "prompt engineering", "langchain", "rag"], category: "IT" },

  // Marketing
  { name: "SEO", aliases: ["seo", "toi uu hoa tim kiem", "search engine optimization"], category: "Marketing" },
  { name: "Google Ads", aliases: ["google ads", "adwords", "sem"], category: "Marketing" },
  { name: "Facebook Ads", aliases: ["facebook ads", "meta ads", "fb ads"], category: "Marketing" },
  { name: "TikTok Ads", aliases: ["tiktok ads", "tiktok marketing"], category: "Marketing" },
  { name: "Content Marketing", aliases: ["content", "sang tao noi dung", "copywriting", "viet content"], category: "Marketing" },
  { name: "Google Analytics 4", aliases: ["ga4", "google analytics", "phan tich du lieu"], category: "Marketing" },
  { name: "Performance Marketing", aliases: ["performance marketing", "chay ads", "toi uu cpa"], category: "Marketing" },
  { name: "Brand Strategy", aliases: ["brand strategy", "chien luoc thuong hieu", "branding"], category: "Marketing" },
  { name: "CRM", aliases: ["crm", "hubspot", "salesforce", "cham soc khach hang"], category: "Marketing" },

  // Accounting & Finance
  { name: "Kế toán tổng hợp", aliases: ["ke toan tong hop", "general accounting"], category: "Finance" },
  { name: "Báo cáo tài chính", aliases: ["bao cao tai chinh", "financial statements", "bctc"], category: "Finance" },
  { name: "Quyết toán thuế", aliases: ["quyet toan thue", "khai thue", "tax reporting"], category: "Finance" },
  { name: "Phần mềm MISA", aliases: ["misa", "phan mem misa", "fast", "bravo"], category: "Finance" },
  { name: "Chuẩn mực VAS/IFRS", aliases: ["vas", "ifrs", "chuan muc ke toan"], category: "Finance" },
  { name: "Phân tích tài chính", aliases: ["financial analysis", "phan tich dau tu", "mo hinh tai chinh"], category: "Finance" },
  { name: "Quản lý dòng tiền", aliases: ["cash flow", "dong tien", "du bao tai chinh"], category: "Finance" },

  // Sales & BD
  { name: "B2B Sales", aliases: ["b2b", "ban hang doanh nghiep", "b2b sales"], category: "Sales" },
  { name: "Đàm phán & Chốt sale", aliases: ["dam phan", "negotiation", "chot sale", "closing"], category: "Sales" },
  { name: "Phát triển thị trường", aliases: ["phat trien thi truong", "business development", "market expansion"], category: "Sales" },
  { name: "Key Account Management", aliases: ["kam", "key account", "khach hang lon"], category: "Sales" },
  { name: "Thuyết trình dự án", aliases: ["pitching", "presentation", "thuyet trinh"], category: "Sales" },

  // HR & Admin
  { name: "Tuyển dụng (Talent Acquisition)", aliases: ["tuyen dung", "recruitment", "headhunting", "ta"], category: "HR" },
  { name: "C&B (Lương & Phúc lợi)", aliases: ["c&b", "compensation", "benefits", "luong thuong"], category: "HR" },
  { name: "Luật Lao Động", aliases: ["luat lao dong", "labor law", "bhxh"], category: "HR" },
  { name: "Đào tạo & Phát triển (L&D)", aliases: ["l&d", "learning and development", "dao tao"], category: "HR" },
  { name: "Văn hóa doanh nghiệp", aliases: ["van hoa doanh nghiep", "employer branding"], category: "HR" },

  // Logistics & Supply Chain
  { name: "Xuất nhập khẩu", aliases: ["xuat nhap khau", "import export", "xnk"], category: "Logistics" },
  { name: "Thủ tục Hải quan", aliases: ["hai quan", "customs clearance", "khai hai quan"], category: "Logistics" },
  { name: "Incoterms", aliases: ["incoterms", "van don", "bill of lading"], category: "Logistics" },
  { name: "Quản lý chuỗi cung ứng", aliases: ["supply chain", "chuoi cung ung", "procurement"], category: "Logistics" },

  // Design
  { name: "Figma", aliases: ["figma", "figma design"], category: "Design" },
  { name: "UI/UX Design", aliases: ["ui/ux", "uiux", "thiet ke giao dien"], category: "Design" },
  { name: "Design System", aliases: ["design system", "he thong thiet ke"], category: "Design" },
  { name: "Adobe Creative Suite", aliases: ["photoshop", "illustrator", "premiere", "after effects"], category: "Design" },

  // Languages & Soft Skills
  { name: "Tiếng Anh", aliases: ["tieng anh", "english", "ielts", "toeic"], category: "Language" },
  { name: "Tiếng Nhật", aliases: ["tieng nhat", "japanese", "jlpt", "n1", "n2", "n3"], category: "Language" },
  { name: "Tiếng Trung", aliases: ["tieng trung", "chinese", "hsk"], category: "Language" },
  { name: "Làm việc nhóm", aliases: ["teamwork", "lam viec nhom"], category: "Soft" },
  { name: "Quản lý thời gian", aliases: ["time management", "quan ly thoi gian", "agile", "scrum"], category: "Soft" },
];

export const PRESET_CV_PROFILES: UserCVProfile[] = [
  {
    fullName: "Nguyễn Hoàng Nam",
    targetRole: "Senior Full-stack Engineer",
    yearsOfExperience: 5,
    skills: ["React", "Next.js", "TypeScript", "Node.js", "AWS", "SQL", "Docker", "Git", "RESTful API", "Tiếng Anh"],
    languages: ["Tiếng Anh (IELTS 7.0)", "Tiếng Việt"],
    summary: "Senior Software Engineer với 5 năm kinh nghiệm chuyên sâu về React, Next.js và Node.js. Đã xây dựng các hệ thống SaaS quy mô hàng triệu người dùng, tối ưu hiệu năng SSR và CI/CD.",
    fileName: "CV_NguyenHoangNam_SeniorFullstack.pdf",
  },
  {
    fullName: "Đặng Minh Trí",
    targetRole: "AI / Machine Learning Engineer",
    yearsOfExperience: 3,
    skills: ["Python", "PyTorch", "LLMs & AI", "Docker", "SQL", "Git", "Tiếng Anh"],
    languages: ["Tiếng Anh (IELTS 7.5)", "Tiếng Việt"],
    summary: "Kỹ sư AI/Machine Learning với 3 năm kinh nghiệm nghiên cứu và triển khai thực tế Large Language Models (LLMs), RAG pipelines, fine-tuning mô hình ngôn ngữ và Computer Vision.",
    fileName: "CV_DangMinhTri_AIEngineer.pdf",
  },
  {
    fullName: "Phạm Quỳnh Anh",
    targetRole: "Senior Mobile Flutter Developer",
    yearsOfExperience: 4,
    skills: ["Flutter", "TypeScript", "Git", "RESTful API", "Làm việc nhóm", "Tiếng Anh"],
    languages: ["Tiếng Anh (Giao tiếp tốt)", "Tiếng Việt"],
    summary: "Kỹ sư phần mềm di động với 4 năm kinh nghiệm chuyên sâu Flutter & Native iOS/Android. Đã phát hành hơn 5 ứng dụng TMĐT và B2B đạt hơn 500,000 lượt tải trên App Store & Google Play.",
    fileName: "CV_PhamQuynhAnh_MobileFlutter.docx",
  },
  {
    fullName: "Lê Tuấn Hưng",
    targetRole: "DevOps & Cloud Platform Architect",
    yearsOfExperience: 6,
    skills: ["AWS", "Kubernetes", "Docker", "CI/CD", "Git", "Microservices", "Python"],
    languages: ["Tiếng Anh (Lưu loát)", "Tiếng Việt"],
    summary: "Lead DevOps & Cloud Engineer với 6 năm kinh nghiệm vận hành hạ tầng Cloud AWS quy mô lớn cho Fintech và E-commerce. Đạt chứng chỉ AWS Solutions Architect Professional và CKA.",
    fileName: "CV_LeTuanHung_DevOpsArchitect.pdf",
  },
];

export function extractSkillsFromText(text: string): string[] {
  const normalized = removeVietnameseTones(text).toLowerCase();
  const detected = new Set<string>();

  for (const item of SKILLS_TAXONOMY) {
    for (const alias of item.aliases) {
      const normAlias = removeVietnameseTones(alias).toLowerCase();
      // Match with word boundary or clean boundary
      const regex = new RegExp(`\\b${normAlias.replace(".", "\\.")}\\b`, "i");
      if (regex.test(normalized) || normalized.includes(normAlias)) {
        detected.add(item.name);
        break;
      }
    }
  }

  return Array.from(detected);
}

export function parseCVText(rawText: string, fileName?: string): UserCVProfile {
  const skills = extractSkillsFromText(rawText);

  // Extract years of experience
  let expYears = 2; // Default
  const expMatch = rawText.match(/(\d+)\s*(năm|years|yr|nam)/i);
  if (expMatch && expMatch[1]) {
    const val = parseInt(expMatch[1], 10);
    if (val >= 0 && val <= 30) expYears = val;
  }

  // Extract target role
  let targetRole = "Chuyên viên phát triển";
  const lines = rawText.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length > 0) {
    // First 3 lines usually contain role or title
    for (let i = 0; i < Math.min(lines.length, 4); i++) {
      if (
        lines[i].toLowerCase().includes("engineer") ||
        lines[i].toLowerCase().includes("developer") ||
        lines[i].toLowerCase().includes("marketing") ||
        lines[i].toLowerCase().includes("kế toán") ||
        lines[i].toLowerCase().includes("sales") ||
        lines[i].toLowerCase().includes("chuyên viên") ||
        lines[i].toLowerCase().includes("trưởng phòng") ||
        lines[i].toLowerCase().includes("lead")
      ) {
        targetRole = lines[i];
        break;
      }
    }
  }

  return {
    fullName: "Ứng viên TopViec AI",
    targetRole,
    yearsOfExperience: expYears,
    skills: skills.length > 0 ? skills : ["Làm việc nhóm", "Tiếng Anh", "Giao tiếp"],
    languages: ["Tiếng Việt", "Tiếng Anh"],
    summary: rawText.slice(0, 200) + "...",
    fileName: fileName || "uploaded_cv.txt",
    rawText,
  };
}

export function calculateMatchAnalysis(cv: UserCVProfile, job: JobListing): MatchAnalysis {
  const cvSkillsLower = cv.skills.map((s) => removeVietnameseTones(s).toLowerCase());
  
  // Combine job skill tags and keywords in description/requirements
  const jobRequiredSkills = [...job.skills_tags];
  
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const skill of jobRequiredSkills) {
    const norm = removeVietnameseTones(skill).toLowerCase();
    const isMatched = cvSkillsLower.some(
      (cs) => cs === norm || norm.includes(cs) || cs.includes(norm)
    );
    if (isMatched) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  // Calculate skill score
  const totalReq = jobRequiredSkills.length;
  const skillRatio = totalReq > 0 ? matchedSkills.length / totalReq : 0.7;
  let rawScore = skillRatio * 70; // 70% weight for skills

  // Experience level bonus/penalty (20% weight)
  let expMatch = true;
  let expScore = 20;
  const jobLevel = job.experience_level;

  if (jobLevel === "INTERN" || jobLevel === "FRESHER") {
    expScore = 20;
  } else if (jobLevel === "JUNIOR") {
    if (cv.yearsOfExperience >= 1) expScore = 20;
    else {
      expScore = 12;
      expMatch = false;
    }
  } else if (jobLevel === "MIDDLE") {
    if (cv.yearsOfExperience >= 2) expScore = 20;
    else if (cv.yearsOfExperience >= 1) expScore = 14;
    else {
      expScore = 8;
      expMatch = false;
    }
  } else if (jobLevel === "SENIOR") {
    if (cv.yearsOfExperience >= 4) expScore = 20;
    else if (cv.yearsOfExperience >= 2) expScore = 12;
    else {
      expScore = 6;
      expMatch = false;
    }
  } else if (jobLevel === "LEAD_MANAGER") {
    if (cv.yearsOfExperience >= 5) expScore = 20;
    else if (cv.yearsOfExperience >= 3) expScore = 10;
    else {
      expScore = 4;
      expMatch = false;
    }
  }

  // Role title similarity bonus (10% weight)
  const normCvRole = removeVietnameseTones(cv.targetRole).toLowerCase();
  const normJobTitle = removeVietnameseTones(job.title).toLowerCase();
  let roleBonus = 5;
  const roleKeywords = normCvRole.split(/\s+/).filter((w) => w.length > 2);
  const matchedKeywords = roleKeywords.filter((w) => normJobTitle.includes(w));
  if (matchedKeywords.length > 0) {
    roleBonus = Math.min(10, 5 + matchedKeywords.length * 3);
  }

  const finalScore = Math.min(99, Math.max(25, Math.round(rawScore + expScore + roleBonus)));

  // Generate recommendation & advice
  let recommendation = "";
  const strengths: string[] = [];
  const adviceTips: string[] = [];

  if (finalScore >= 80) {
    recommendation = "Rất phù hợp! Hồ sơ của bạn nằm trong top ứng viên sáng giá nhất cho vị trí này.";
    strengths.push(`Khớp ${matchedSkills.length}/${totalReq} kỹ năng trọng tâm của nhà tuyển dụng.`);
    if (expMatch) strengths.push(`Kinh nghiệm (${cv.yearsOfExperience} năm) hoàn toàn đáp ứng cấp bậc yêu cầu.`);
    adviceTips.push("Nêu bật các dự án thực tế liên quan đến " + matchedSkills.slice(0, 3).join(", ") + " trong thư ứng tuyển.");
    adviceTips.push("Sẵn sàng ứng tuyển ngay để hồ sơ được HR liên hệ sớm nhất!");
  } else if (finalScore >= 55) {
    recommendation = "Khá phù hợp. Bạn đáp ứng tốt các tiêu chí cốt lõi nhưng có một vài kỹ năng cần chuẩn bị thêm.";
    strengths.push(`Nắm chắc các kỹ năng nền tảng: ${matchedSkills.slice(0, 3).join(", ")}.`);
    if (missingSkills.length > 0) {
      adviceTips.push(`Nhà tuyển dụng rất quan tâm đến [${missingSkills.slice(0, 2).join(", ")}]. Hãy bổ sung kinh nghiệm hoặc chứng chỉ liên quan.`);
    }
    adviceTips.push("Nhấn mạnh khả năng tự học nhanh và tư duy giải quyết vấn đề khi phỏng vấn.");
  } else {
    recommendation = "Độ tương thích khiêm tốn. Cần trau dồi thêm kỹ năng chuyên môn trước khi ứng tuyển.";
    if (missingSkills.length > 0) {
      adviceTips.push(`Cần học bổ sung: ${missingSkills.slice(0, 3).join(", ")} để tăng cơ hội trúng tuyển.`);
    }
    adviceTips.push("Xem xét vị trí cấp bậc thấp hơn một bậc để tích lũy kinh nghiệm thực chiến.");
  }

  return {
    score: finalScore,
    matchedSkills,
    missingSkills,
    experienceMatch: expMatch,
    experienceGapNote: expMatch ? undefined : `Yêu cầu kinh nghiệm chưa tương xứng với ${cv.yearsOfExperience} năm hiện tại.`,
    recommendation,
    strengths,
    adviceTips,
  };
}
