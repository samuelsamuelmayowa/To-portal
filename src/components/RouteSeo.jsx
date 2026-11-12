import { Helmet } from "react-helmet";
import { useContext } from "react";
import { useLocation } from "react-router-dom";
import CartItemContext from "../context/CartItemContext";

const SITE_URL = "https://www.to-analytics.com";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

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
  "/lab": {
    title: "Free Splunk Simulator & Search Lab | T.O Analytics",
    description:
      "Practice Splunk search, investigate security events, save SPL searches and build dashboards in T.O Analytics’ free hands-on Splunk learning lab.",
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
};

function getPageMetadata(pathname, courses) {
  if (PAGE_METADATA[pathname]) return PAGE_METADATA[pathname];

  if (pathname.startsWith("/courses/")) {
    const rawSlug = pathname.slice("/courses/".length).split("/")[0];
    let courseName = rawSlug;
    try {
      courseName = decodeURIComponent(rawSlug);
    } catch {
      // Keep the undecoded slug if the URL contains malformed encoding.
    }
    const course = courses?.find(
      (item) => item.courseName.toLowerCase() === courseName.toLowerCase()
    );

    if (!course) {
      return {
        title: "Course Not Found | T.O Analytics",
        description: "This course could not be found.",
        indexable: false,
      };
    }

    const description = `${course.courseName} course by T.O Analytics. ${course.description}`
      .replace(/\s+/g, " ")
      .slice(0, 160);

    return {
      title: `${course.courseName} Course | T.O Analytics`,
      description,
    };
  }

  return null;
}

export default function RouteSeo() {
  const { pathname } = useLocation();
  const { COURSES = [] } = useContext(CartItemContext);
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const metadata = getPageMetadata(normalizedPath, COURSES);
  const canonicalUrl = metadata && metadata.indexable !== false
    ? `${SITE_URL}${normalizedPath}`
    : null;
  const title = metadata?.title || "T.O Analytics";
  const description =
    metadata?.description ||
    "T.O Analytics provides practical technology training, mentorship and software solutions.";
  const structuredData = metadata && metadata.indexable !== false && canonicalUrl
    ? JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: title,
        description,
        inLanguage: "en",
        isPartOf: { "@id": `${SITE_URL}/#website` },
      }).replace(/</g, "\\u003c")
    : null;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta
        name="robots"
        content={
          metadata?.indexable === false || !metadata
            ? "noindex, nofollow"
            : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        }
      />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="T.O Analytics" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta property="og:image" content={DEFAULT_OG_IMAGE} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="T.O Analytics offers practical technology training, mentorship and software solutions." />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />
      <meta name="twitter:image:alt" content="T.O Analytics offers practical technology training, mentorship and software solutions." />
      {structuredData && (
        <script type="application/ld+json">{structuredData}</script>
      )}
    </Helmet>
  );
}
