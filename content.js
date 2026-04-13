const content = {
  en: {
    pageTitle: "Bai Zeyang | Academic Homepage",
    name: "Bai Zeyang",
    tagline: "M.Eng. Student at UCAS | 3D Vision, Controllable Generation, AI4Sci",
    aboutTitle: "About Me",
    aboutText:
      "I am currently an M.Eng. student in Computer Applied Technology at the University of Chinese Academy of Sciences (UCAS, 2025.09–2028.06). Prior to this, I received my B.Eng. in Artificial Intelligence from Central South University (CSU, 2021.09–2025.06). My primary research focuses on sparse-view 3D Gaussian Splatting, diffusion-based controllable 3D generation, and AI for Science (AI4Sci).",
    interestsTitle: "Research Interests",
    interests: [
      "Sparse-View 3D Gaussian Splatting & Neural Rendering",
      "Diffusion-Based 3D Scene Generation & Editing",
      "AI for Science (AI4Sci) & Trustworthy AI"
    ],
    publicationsTitle: "Publications",
    publications: [
      "<strong>Seeing the Unseen: Gaussians Diffusion for Sparse-View 3D Generalization</strong><br><em><strong>Bai, Z.*</strong>, Wang, Y., Wang, Y., Xiao, J.</em><br>ECCV 2026 (Under review) — First Author<br><span style='color: var(--text-secondary); font-size: 0.95em; display: inline-block; margin-top: 8px;'>Developed a semantic-conditioned diffusion repair framework for feed-forward 3DGS under sparse views, solving unseen region modeling and improving scene extrapolation PSNR by 2.5dB while maintaining real-time rendering.</span>",

      "<strong>PartGo: Training-Free Localized 3D Part Editing with Constrained Flow</strong><br><em>Niu, H., Meng, L., <strong>Bai, Z.</strong>, Wang, Y., Xiao, J.</em><br>ECCV 2026 (Under review)<br><span style='color: var(--text-secondary); font-size: 0.95em; display: inline-block; margin-top: 8px;'>Developed a terminal-flow-guided 3D part editing framework decoupling semantic localization and geometric deformation for zero-shot editing.</span>",

      "<strong>GraphSplat: Sparse-View Generalizable 3D Gaussian Splatting is Worth Graph of Nodes</strong><br><em><strong>Bai, Z.*</strong>, Wang, Y., Yu, D., Xiao, J., Liu, L.</em><br>ACM Multimedia 2025 (Oral) — First Author<br><span style='color: var(--text-secondary); font-size: 0.95em; display: inline-block; margin-top: 8px;'>Proposed modeling pixels as graph nodes fusing cross-view and single-view priors to combat depth degradation and view matching failures in sparse-view 3DGS.</span>",

      "<strong>Disability-Net: A Causality-based Disability Early Warning Model Using Longitudinal Data</strong><br><em>Nie, H., <strong>Bai, Z.</strong>, Xie, B.</em><br>Nature Digital Medicine 2024 (Under review) — Second Author<br><span style='color: var(--text-secondary); font-size: 0.95em; display: inline-block; margin-top: 8px;'>Developed a graph neural network model employing adaptive temporal sequence perception and causal discovery to predict elderly disability risks using clinical EHR data.</span>",

      "<strong>Stroke-Seg: A Deep Learning-based Framework for Chinese Stroke Segmentation</strong><br><em>Gong, X., <strong>Bai, Z.</strong>, Nie, H., Xie, B.</em><br>IET Image Processing 2024 (Published) — Co-first Author<br><span style='color: var(--text-secondary); font-size: 0.95em; display: inline-block; margin-top: 8px;'>Designed a multi-label semantic segmentation framework leveraging stroke prior knowledge for complex character stroke segmentation.</span>"
    ],
    projectsTitle: "Other Projects",
    projects: [
      "<strong>HKUST Research Internship (2026.03–Present):</strong> Engaged in part-level dynamic neural reconstruction research expanding the SAM3D framework.",
      "<strong>Missing Modality Glaucoma Diagnosis (2023–2024):</strong> Formulated 'Freeze-Missing-VF', an assistance system handling structrual data missing scenarios for early disease screening."
    ],
    educationTitle: "Education",
    education: [
      "<strong>University of Chinese Academy of Sciences (UCAS)</strong> — M.Eng. in Computer Applied Technology (2025.09–2028.06)",
      "<strong>Central South University (CSU)</strong> — B.Eng. in Artificial Intelligence (2021.09–2025.06)"
    ],
    contactTitle: "Contact",
    contactMessage: "Open to exciting collaborations in 3D vision and AI4Sci.",
    contact: [
      { label: "Email", href: "mailto:zeyangbai.rvo@gmail.com", text: "zeyangbai.rvo@gmail.com", icon: "📧" },
      { label: "GitHub", href: "https://github.com/Rvosuke", text: "github.com/Rvosuke", icon: "💻" }
    ],
    footer: "© 2026 Bai Zeyang. Designed with standard Web Technologies."
  },
  zh: {
    pageTitle: "白泽阳 | 学术主页",
    name: "白泽阳 (Zeyang Bai)",
    tagline: "中国科学院大学硕士生 | 三维视觉、可控生成、AI for Science",
    aboutTitle: "关于我",
    aboutText:
      "我目前在中国科学院大学攻读计算机应用技术硕士学位（2025.09–2028.06）。此前，我在中南大学人工智能专业获得工学学士学位（2021.09–2025.06）。我的主要研究兴趣包括面向稀疏视角的三维高斯溅射（3D Gaussian Splatting）、基于扩散模型的可控三维生成，以及 AI for Science (AI4Sci)。",
    interestsTitle: "研究兴趣",
    interests: [
      "稀疏视角 3D Gaussian Splatting 与神经渲染",
      "基于扩散模型的三维场景生成与可控编辑",
      "AI for Science (AI4Sci) 与可信人工智能"
    ],
    publicationsTitle: "学术论文与研究",
    publications: [
      "<strong>Seeing the Unseen: Gaussians Diffusion for Sparse-View 3D Generalization</strong><br><em><strong>Bai, Z.*</strong>, Wang, Y., Wang, Y., Xiao, J.</em><br>ECCV 2026 (在投) — 第一作者<br><span style='color: var(--text-secondary); font-size: 0.95em; display: inline-block; margin-top: 8px;'>针对稀疏视角前馈式3DGS的未见区域合成问题，设计了带有语义条件嵌入的扩散修补模型，在保持0.1s极速渲染的同时使场景外推任务的PSNR提升了2.5dB。</span>",

      "<strong>PartGo: Training-Free Localized 3D Part Editing with Constrained Flow</strong><br><em>Niu, H., Meng, L., <strong>Bai, Z.</strong>, Wang, Y., Xiao, J.</em><br>ECCV 2026 (在投)<br><span style='color: var(--text-secondary); font-size: 0.95em; display: inline-block; margin-top: 8px;'>研发了基于终端流导引的三维部件编辑框架，通过解耦语义定位与几何变形，实现了无需训练的端到端可控部件编辑。</span>",

      "<strong>GraphSplat: Sparse-View Generalizable 3D Gaussian Splatting is Worth Graph of Nodes</strong><br><em><strong>Bai, Z.*</strong>, Wang, Y., Yu, D., Xiao, J., Liu, L.</em><br>ACM Multimedia 2025 (Oral) — 第一作者<br><span style='color: var(--text-secondary); font-size: 0.95em; display: inline-block; margin-top: 8px;'>创新性地将图像像素建模为图节点，融合跨视角与单视特征进行深度退化补偿，结合多视聚合图注意力机制实现了毫秒级的高质量稀疏视角神经重建。</span>",

      "<strong>Disability-Net: A Causality-based Disability Early Warning Model Using Longitudinal Data</strong><br><em>Nie, H., <strong>Bai, Z.</strong>, Xie, B.</em><br>Nature Digital Medicine 2024 (在投) — 第二作者<br><span style='color: var(--text-secondary); font-size: 0.95em; display: inline-block; margin-top: 8px;'>结合因果发现算法与自适应时序感知技术，基于纵向电子病历数据开发了用于老年个体失能风险的预测模型。</span>",

      "<strong>Stroke-Seg: A Deep Learning-based Framework for Chinese Stroke Segmentation</strong><br><em>Gong, X., <strong>Bai, Z.</strong>, Nie, H., Xie, B.</em><br>IET Image Processing 2024 (已发表) — 共同一作<br><span style='color: var(--text-secondary); font-size: 0.95em; display: inline-block; margin-top: 8px;'>针对汉字笔画中的复杂交叉形态，设计了引入笔画先验的多标签语义分割网络，提升了分割效果的清晰度与准确性。</span>"
    ],
    projectsTitle: "其他项目",
    projects: [
      "<strong>基于SAM3D的部件级重建</strong>（香港科技大学 科研实习，2026.03–至今）：参与流式三维重建的远程合作研究，侧重于复杂动态场景下的SAM3D算法扩展。",
      "<strong>缺失模态青光眼智能辅助</strong>（重点研发计划分项，2023–2024）：开发了针对数据缺失环境下的辅助诊疗预备模型（Freeze-Missing-VF）。"
    ],
    educationTitle: "教育经历",
    education: [
      "<strong>中国科学院大学（UCAS）</strong> — 计算机应用技术 · 工学硕士（2025.09–2028.06）",
      "<strong>中南大学（CSU）</strong> — 人工智能 · 工学学士（2021.09–2025.06）"
    ],
    contactTitle: "联系方式",
    contactMessage: "欢迎围绕三维视觉或 AI for Science 领域进行学术交流与合作探讨。",
    contact: [
      { label: "邮箱", href: "mailto:zeyangbai.rvo@gmail.com", text: "zeyangbai.rvo@gmail.com", icon: "📧" },
      { label: "GitHub", href: "https://github.com/Rvosuke", text: "github.com/Rvosuke", icon: "💻" }
    ],
    footer: "© 2026 白泽阳. 保持热爱，奔赴山海。"
  }
};

function resolveLang() {
  const params = new URLSearchParams(window.location.search);
  const urlLang = params.get("lang");
  if (urlLang === "zh" || urlLang === "en") return urlLang;

  try {
    const stored = localStorage.getItem("lang");
    if (stored === "zh" || stored === "en") return stored;
  } catch (e) {}

  const browserLang = (navigator.language || "en").toLowerCase();
  return browserLang.startsWith("zh") ? "zh" : "en";
}

function safeSetLang(lang) {
  try {
    localStorage.setItem("lang", lang);
  } catch (e) {}
}

function renderList(id, items) {
  const ul = document.getElementById(id);
  if (!ul) return;
  ul.innerHTML = "";
  items.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = item;
    ul.appendChild(li);
  });
}

function renderContacts(items) {
  const ul = document.getElementById("contact-list");
  if (!ul) return;
  ul.innerHTML = "";
  items.forEach((item) => {
    const a = document.createElement("a");
    a.href = item.href;
    a.className = "contact-btn";
    a.innerHTML = `<span class="icon">${item.icon}</span><span class="text">${item.text}</span>`;
    ul.appendChild(a);
  });
}

function setLanguage(lang) {
  const data = content[lang] || content.en;
  document.documentElement.lang = lang;
  document.title = data.pageTitle;

  const textIds = [
    "name", "tagline", "about-title", "about-text",
    "interests-title", "publications-title", "projects-title",
    "education-title", "contact-message", "footer-text"
  ];
  
  textIds.forEach(id => {
    const el = document.getElementById(id);
    if (el && data[id.replace(/-([a-z])/g, (g) => g[1].toUpperCase())]) {
      el.innerHTML = data[id.replace(/-([a-z])/g, (g) => g[1].toUpperCase())];
    }
  });

  renderList("interests-list", data.interests);
  renderList("publications-list", data.publications);
  renderList("projects-list", data.projects);
  renderList("education-list", data.education);
  renderContacts(data.contact);

  const langEnBtn = document.getElementById("lang-en");
  const langZhBtn = document.getElementById("lang-zh");
  if(langEnBtn) langEnBtn.classList.toggle("active", lang === "en");
  if(langZhBtn) langZhBtn.classList.toggle("active", lang === "zh");
}

function setupScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.animate-on-scroll').forEach(section => {
    observer.observe(section);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const initialLang = resolveLang();
  setLanguage(initialLang);

  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => {
      const lang = button.getAttribute("data-lang");
      if (lang !== "en" && lang !== "zh") return;
      safeSetLang(lang);
      setLanguage(lang);
      
      // Re-trigger animations softly on language change
      document.querySelectorAll('.animate-on-scroll').forEach(el => {
        el.classList.remove('visible');
        setTimeout(() => el.classList.add('visible'), 50);
      });
    });
  });

  setTimeout(setupScrollAnimations, 100);
});
