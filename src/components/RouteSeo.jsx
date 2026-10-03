import { Helmet } from "react-helmet";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://www.to-analytics.com";

const PAGE_METADATA = {
  "/": {
    title: "T.O Analytics | Practical Tech Training & Software Solutions",
    description:
      "Build practical skills with hands-on Splunk, cybersecurity, Linux, data and stock trading education from T.O Analytics. Explore training, mentorship and software services.",
  },
  "/courses": {
    title: "Technology Courses | T.O Analytics",
    description:
      "Explore practical technology, Splunk, cybersecurity, Linux, data and stock market courses designed to build skills through guided learning.",
  },
  "/about": {
    title: "About T.O Analytics | Practical Technology Education",
    description:
      "Learn about T.O Analytics and our mission to make practical technology education, cybersecurity training and career development accessible.",
  },
  "/career": {
    title: "Technology Careers | T.O Analytics",
    description:
      "Explore current technology and finance job opportunities in the United States, United Kingdom, Canada and Germany.",
  },
  "/blog": {
    title: "Technology & Splunk News | T.O Analytics Blog",
    description:
      "Read technology, Splunk and cybersecurity updates curated for learners and professionals by T.O Analytics.",
  },
  "/contact": {
    title: "Contact T.O Analytics | Training & Software Services",
    description:
      "Contact T.O Analytics about technology training, mentorship, software development and learning programs.",
  },
  "/mentorship": {
    title: "Technology Mentorship & Career Preparation | T.O Analytics",
    description:
      "Build job-ready technology skills with structured mentorship, hands-on practice, career guidance and interview preparation.",
  },
  "/splunk-orientation": {
    title: "Splunk Training Orientation | T.O Analytics",
    description:
      "Get started with Splunk training at T.O Analytics and learn about the hands-on learning path, course topics and practical labs.",
  },
  "/toskillab": {
    title: "Technology Interview Practice | T.O Skill Lab",
    description:
      "Practice technology interview scenarios and assess your readiness for Splunk, SOC analyst and engineering roles with T.O Skill Lab.",
  },
  "/toskillab/lab": {
    title: "Splunk Security Investigation Lab | T.O Analytics",
    description:
      "Build practical Splunk and security investigation skills with realistic, hands-on incident scenarios.",
  },
  "/trading-simulator": {
    title: "Paper Trading Simulator | T.O Analytics",
    description:
      "Practice stock and options trading strategies in a virtual account with the T.O Analytics paper trading simulator.",
  },
  "/sessions": {
    title: "Training Sessions | T.O Analytics",
    description:
      "Explore training sessions and learning opportunities from T.O Analytics.",
  },
  "/liveCourses": {
    title: "Live Technology Courses | T.O Analytics",
    description:
      "Browse live technology classes and instructor-led learning from T.O Analytics.",
  },
  "/commands": {
    title: "Splunk Search Commands Reference | T.O Analytics",
    description:
      "Browse a practical reference to Splunk Search Processing Language commands and functions for building effective searches.",
  },
  "/dictionary": {
    title: "Splunk & Technology Dictionary | T.O Analytics",
    description:
      "Review plain-language definitions for Splunk, data and technology terms used in hands-on learning.",
  },
  "/stockmarkert": {
    title: "Stock Market Overview | T.O Analytics",
    description:
      "Explore stock market information and market overviews with T.O Analytics learning tools.",
  },
};

function getPageMetadata(pathname) {
  if (PAGE_METADATA[pathname]) return PAGE_METADATA[pathname];

  if (pathname.startsWith("/courses/")) {
    const rawSlug = pathname.slice("/courses/".length).split("/")[0];
    let courseName = rawSlug;
    try {
      courseName = decodeURIComponent(rawSlug);
    } catch {
      // Keep the undecoded slug if the URL contains malformed encoding.
    }
    courseName = courseName
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

    return {
      title: `${courseName} Course | T.O Analytics`,
      description: `Explore the ${courseName} course from T.O Analytics, with practical instruction and guided learning to help you build career-ready skills.`,
    };
  }

  return null;
}

export default function RouteSeo() {
  const { pathname } = useLocation();
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const metadata = getPageMetadata(normalizedPath);
  const canonicalUrl = metadata
    ? `${SITE_URL}${normalizedPath}`
    : null;
  const title = metadata?.title || "T.O Analytics";
  const description =
    metadata?.description ||
    "T.O Analytics provides practical technology training, mentorship and software solutions.";

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={metadata ? "index, follow" : "noindex, nofollow"} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="T.O Analytics" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}
