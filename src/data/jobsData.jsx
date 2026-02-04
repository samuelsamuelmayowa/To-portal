/* ============================================
   MASSIVE JOB OPPORTUNITIES DATABASE
   Auto-generates thousands of job listings
   ============================================ */

// Base job templates
const baseJobs = [
  // SPLUNK ROLES
  {
    title: "Splunk Engineer",
    company: "Splunk",
    location: "Remote, USA",
    url: "https://www.splunk.com/en_us/careers/jobs/",
  },
  {
    title: "Splunk Developer",
    company: "Splunk",
    location: "San Francisco, California, USA",
    url: "https://www.splunk.com/en_us/careers/jobs/",
  },
  {
    title: "Splunk Architect",
    company: "Splunk",
    location: "Remote, USA",
    url: "https://www.splunk.com/en_us/careers/jobs/",
  },
  
  // SECURITY OPERATIONS CENTER
  {
    title: "SOC Analyst Level 1",
    company: "Deloitte",
    location: "New York, USA",
    url: "https://www2.deloitte.com/us/en/careers/search-jobs.html",
  },
  {
    title: "SOC Analyst Level 2",
    company: "Accenture",
    location: "Chicago, Illinois, USA",
    url: "https://www.accenture.com/us-en/careers",
  },
  {
    title: "SOC Analyst Level 3",
    company: "IBM",
    location: "Raleigh, North Carolina, USA",
    url: "https://www.ibm.com/careers/",
  },
  {
    title: "Senior SOC Analyst",
    company: "Cisco",
    location: "San Jose, California, USA",
    url: "https://www.cisco.com/c/en/us/about/careers.html",
  },

  // SIEM ROLES
  {
    title: "SIEM Engineer",
    company: "CrowdStrike",
    location: "Austin, Texas, USA",
    url: "https://crowdstrike.wd5.myworkdayjobs.com/en-US/crowdstrike_careers",
  },
  {
    title: "SIEM Administrator",
    company: "Palo Alto Networks",
    location: "Santa Clara, California, USA",
    url: "https://jobs.paloaltonetworks.com/",
  },
  {
    title: "SIEM Specialist",
    company: "Fortinet",
    location: "Sunnyvale, California, USA",
    url: "https://www.fortinet.com/careers",
  },

  // CLOUD SECURITY
  {
    title: "Cloud Security Engineer",
    company: "Amazon Web Services (AWS)",
    location: "Remote, USA",
    url: "https://www.amazon.jobs/en/",
  },
  {
    title: "Cloud Security Architect",
    company: "Microsoft Azure",
    location: "Seattle, Washington, USA",
    url: "https://careers.microsoft.com/us/en/",
  },
  {
    title: "Cloud Infrastructure Engineer",
    company: "Google Cloud",
    location: "Remote, USA",
    url: "https://careers.google.com/",
  },
  {
    title: "Cloud DevOps Engineer",
    company: "Oracle Cloud",
    location: "Austin, Texas, USA",
    url: "https://www.oracle.com/careers/",
  },

  // DEVOPS ROLES
  {
    title: "DevOps Engineer",
    company: "Netflix",
    location: "Los Gatos, California, USA",
    url: "https://jobs.netflix.com/",
  },
  {
    title: "Site Reliability Engineer",
    company: "Google",
    location: "Mountain View, California, USA",
    url: "https://careers.google.com/",
  },
  {
    title: "Infrastructure Engineer",
    company: "Facebook",
    location: "Menlo Park, California, USA",
    url: "https://www.facebookcareers.com/",
  },
  {
    title: "Kubernetes Specialist",
    company: "Red Hat",
    location: "Raleigh, North Carolina, USA",
    url: "https://www.redhat.com/en/jobs",
  },

  // INCIDENT RESPONSE
  {
    title: "Incident Response Specialist",
    company: "Mandiant",
    location: "Arlington, Virginia, USA",
    url: "https://www.mandiant.com/careers",
  },
  {
    title: "Incident Handler",
    company: "Rapid7",
    location: "Boston, Massachusetts, USA",
    url: "https://www.rapid7.com/careers/",
  },
  {
    title: "Threat Analyst",
    company: "Proofpoint",
    location: "Sunnyvale, California, USA",
    url: "https://www.proofpoint.com/us/careers",
  },

  // LOG ANALYSIS & DATA
  {
    title: "Log Analysis Engineer",
    company: "Elastic",
    location: "Remote, USA",
    url: "https://www.elastic.co/about/careers/",
  },
  {
    title: "Data Pipeline Engineer",
    company: "Datadog",
    location: "New York, USA",
    url: "https://www.datadoghq.com/careers/",
  },
  {
    title: "Data Analytics Engineer",
    company: "Sumo Logic",
    location: "Redwood City, California, USA",
    url: "https://www.sumologic.com/careers/",
  },

  // LINUX & SYSTEM ADMIN
  {
    title: "Linux System Administrator",
    company: "Red Hat",
    location: "Remote, USA",
    url: "https://www.redhat.com/en/jobs",
  },
  {
    title: "System Engineer",
    company: "CentOS",
    location: "Remote, USA",
    url: "https://www.centos.org/",
  },
  {
    title: "Infrastructure Administrator",
    company: "Ubuntu",
    location: "Remote, USA",
    url: "https://canonical.com/careers",
  },

  // CYBERSECURITY ROLES
  {
    title: "Cybersecurity Engineer",
    company: "Microsoft",
    location: "Redmond, Washington, USA",
    url: "https://careers.microsoft.com/",
  },
  {
    title: "Security Operations Manager",
    company: "JPMorgan Chase",
    location: "New York, USA",
    url: "https://careers.jpmorgan.com/",
  },
  {
    title: "Penetration Tester",
    company: "Synack",
    location: "Remote, USA",
    url: "https://www.synack.com/careers/",
  },
];

// US Locations
const usLocations = [
  "Remote, USA",
  "New York, USA",
  "Los Angeles, California, USA",
  "Chicago, Illinois, USA",
  "Houston, Texas, USA",
  "Phoenix, Arizona, USA",
  "Philadelphia, Pennsylvania, USA",
  "San Antonio, Texas, USA",
  "San Diego, California, USA",
  "Dallas, Texas, USA",
  "San Jose, California, USA",
  "Austin, Texas, USA",
  "Jacksonville, Florida, USA",
  "Denver, Colorado, USA",
  "Boston, Massachusetts, USA",
  "Seattle, Washington, USA",
  "Miami, Florida, USA",
  "Atlanta, Georgia, USA",
  "Portland, Oregon, USA",
  "Las Vegas, Nevada, USA",
  "San Francisco, California, USA",
  "Raleigh, North Carolina, USA",
  "Hybrid - USA",
  "Washington, D.C., USA",
  "Baltimore, Maryland, USA",
  "Charlotte, North Carolina, USA",
  "Nashville, Tennessee, USA",
  "Minneapolis, Minnesota, USA",
  "Phoenix, Arizona, USA",
  "Sunnyvale, California, USA",
  "Mountain View, California, USA",
  "Palo Alto, California, USA",
  "Redwood City, California, USA",
];

// Companies
const companies = [
  "Splunk",
  "Deloitte",
  "Accenture",
  "IBM",
  "Cisco",
  "CrowdStrike",
  "Palo Alto Networks",
  "Fortinet",
  "Amazon Web Services",
  "Microsoft",
  "Google Cloud",
  "Oracle",
  "Netflix",
  "Meta",
  "Apple",
  "Adobe",
  "Salesforce",
  "ServiceNow",
  "CyberArk",
  "Okta",
  "SentinelOne",
  "Tenable",
  "Zscaler",
  "Cloudflare",
  "Elastic",
  "Datadog",
  "Sumo Logic",
  "New Relic",
  "Dynatrace",
  "HashiCorp",
  "JFrog",
  "GitLab",
  "GitHub",
  "BitBucket",
  "Jenkins",
  "CircleCI",
  "Terraform",
  "Ansible",
  "Chef",
  "Puppet",
  "Docker",
  "Kubernetes",
  "OpenShift",
  "Mandiant",
  "Rapid7",
  "Proofpoint",
  "Mimecast",
  "Zscaler",
  "Fortinet",
  "Palo Alto",
  "Checkpoint",
  "Juniper",
  "Arista",
  "Nvidia",
  "AMD",
  "Intel",
  "Dell",
  "HP",
  "Lenovo",
  "VMware",
  "Citrix",
  "F5",
  "Radcom",
  "ExtraHop",
  "Gigamon",
  "Glasswall",
  "Carbon Black",
  "Cylance",
  "Darktrace",
  "Deep Instinct",
  "Morphisec",
  "Cybereason",
];

// Job Titles with variations
const jobTitles = [
  "Engineer",
  "Senior Engineer",
  "Lead Engineer",
  "Principal Engineer",
  "Staff Engineer",
  "Architect",
  "Specialist",
  "Expert",
  "Developer",
  "Administrator",
  "Analyst",
  "Manager",
  "Senior Manager",
  "Director",
  "VP of",
  "Head of",
  "Consultant",
  "Senior Consultant",
  "Principal Consultant",
  "Contractor",
  "Technician",
  "Technologist",
  "Officer",
  "Officer (CISO)",
  "Advisor",
  "Senior Advisor",
];

// Job Categories
const categories = [
  "Splunk",
  "SIEM",
  "Cloud",
  "DevOps",
  "Security",
  "Linux",
  "AWS",
  "Azure",
  "GCP",
  "Kubernetes",
  "Docker",
  "Incident Response",
  "Threat Analysis",
];

// Seniority levels
const seniorityLevels = ["", "Senior ", "Lead ", "Principal ", "Staff "];

// Generate thousands of job variations
export function generateJobs(count = 1000) {
  const generatedJobs = [];
  const usedCombinations = new Set();

  for (let i = 0; i < count; i++) {
    // Get random components
    const randomSeniority =
      seniorityLevels[Math.floor(Math.random() * seniorityLevels.length)];
    const randomCategory =
      categories[Math.floor(Math.random() * categories.length)];
    const randomTitle =
      jobTitles[Math.floor(Math.random() * jobTitles.length)];
    const randomCompany =
      companies[Math.floor(Math.random() * companies.length)];
    const randomLocation =
      usLocations[Math.floor(Math.random() * usLocations.length)];

    // Create unique job title
    let jobTitle = `${randomSeniority}${randomCategory} ${randomTitle}`;

    // Avoid exact duplicates
    const combination = `${jobTitle}-${randomCompany}-${randomLocation}`;
    if (usedCombinations.has(combination)) {
      i--;
      continue;
    }
    usedCombinations.add(combination);

    // Create base URL
    const companyUrlMap = {
      Splunk: "https://www.splunk.com/en_us/careers/jobs/",
      Deloitte: "https://www2.deloitte.com/us/en/careers/search-jobs.html",
      Accenture: "https://www.accenture.com/us-en/careers",
      IBM: "https://www.ibm.com/careers/",
      Cisco: "https://www.cisco.com/c/en/us/about/careers.html",
      CrowdStrike: "https://crowdstrike.wd5.myworkdayjobs.com/en-US/crowdstrike_careers",
      "Palo Alto Networks": "https://jobs.paloaltonetworks.com/",
      Fortinet: "https://www.fortinet.com/careers",
      "Amazon Web Services": "https://www.amazon.jobs/en/",
      Microsoft: "https://careers.microsoft.com/us/en/",
      "Google Cloud": "https://careers.google.com/",
      Netflix: "https://jobs.netflix.com/",
      Meta: "https://www.metacareers.com/",
      Apple: "https://www.apple.com/careers/",
      Salesforce: "https://www.salesforce.com/careers/",
      ServiceNow: "https://www.servicenow.com/careers.html",
      CyberArk: "https://www.cyberark.com/careers/",
      Okta: "https://www.okta.com/careers/",
      SentinelOne: "https://www.sentinelone.com/careers/",
      Tenable: "https://www.tenable.com/careers",
      Zscaler: "https://www.zscaler.com/careers",
      Elastic: "https://www.elastic.co/about/careers/",
      Datadog: "https://www.datadoghq.com/careers/",
      "Sumo Logic": "https://www.sumologic.com/careers/",
      Docker: "https://www.docker.com/careers/",
      HashiCorp: "https://www.hashicorp.com/careers/",
      GitLab: "https://about.gitlab.com/jobs/",
      GitHub: "https://github.com/careers",
    };

    const url =
      companyUrlMap[randomCompany] ||
      `https://www.${randomCompany.toLowerCase().replace(/ /g, "")}.com/careers/`;

    generatedJobs.push({
      title: jobTitle,
      company: randomCompany,
      location: randomLocation,
      url: url,
      category: randomCategory,
    });
  }

  return generatedJobs;
}

// Export pre-generated jobs database
export const massiveJobsDatabase = generateJobs(2500);

// Export static base jobs as fallback
export const staticJobs = baseJobs;

// Combined export
export const getAllJobs = () => {
  return [...massiveJobsDatabase];
};
