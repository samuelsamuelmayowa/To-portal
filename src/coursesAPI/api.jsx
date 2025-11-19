import splunk from "../assets/images/splunk.png";
import linux from "../assets/images/linux.png";
import drone from "../assets/images/drone.jpg";
import stock from "../assets/images/stock.png";
import data from "../assets/images/data.jpg";
import photography from "../assets/images/photography.jpg";
import videography from "../assets/images/videography.jpg";
import mentorship from "../assets/images/mentorshipIMG.jpg"

export default [
    {
        id: 1,
        image: splunk,
        courseName: "Splunk",
        intro: "The Complete Splunk Bootcamp",
        description: "A comprehensive course on Splunk. Learn, analyze and optimize with our splunk course",
        whatToLearn: [
            "Splunk user to admin level",
            "Splunk component and splunk data flow",
            "Splunk installation and configuration",
            "Data onboarding/Data parsing",
            "Splunk SPL",
            "Splunk alerts/ reports/ saved searches",
            "Splunk Dashboarding",
            "Data enrichment (Data Model)",
            "Regular expressions (REGEX)",
            "Distributed environment configuration (Architect exam prep)",
            "Splunk clustering",
        ],
        price: 3500,
        
    },
    {
        id: 2,
        image: linux,
        courseName: "Linux",
        intro: "Complete  Linux Mastery",
        description: "Master the command line, harness freedom and embrace open-source awareness with our Linux course",
        whatToLearn: [
            "Introduction to Linux",
            "File system & directory structure",
            "User  & group management",
            "File permissions and security",
            "Shell scripting",
            "Networking & network configuration",
            "Package management & software installation",
            "System administration tasks",
            "Linux server management",
        ],
        price: 2000
        // price:1
    },
    {
        id: 3,
        image: stock,
        courseName: "Stock & Options",
        intro: "Ultimate approach to financial decisions",
        description: "Everything you need to know to unlock financial freedom and success",
        whatToLearn: [
            "Fundamentals of stock trading",
            "Financial Literacy",
            "Stock option trading 101",
            "Stock option trading 201",
            "Stock market psychology",
            "Charts reading 101",
            "Advanced charts reading 201",
            "Fundamentals of crypto trading",
            "Forex trading",
        ],
        otherSubCourses: [
            {
                id: 31,
                name: "Fundamental of Stock Trading",
                price: 100,
                duration: "1 hour",
                description: "Learn the nitty gritty of  low-priced stocks. Discover how to spot potential winners and navigate the risks.",
                whatToLearn: [
                    "Research & Analysis",
                    "Risk Management",
                    "Trading stratagies",
                    "Market psychology",
                ]
            },
            {
                id: 32,
                name: "Financial Literacy",
                price: 100,
                duration: "1 hour",
                description: "Gain the knowledge and understanding of financial concepts & skills that are necessary to make informed & effective financial decisions.",
                whatToLearn: [
                    "Budgeting",
                    "Saving & investing",
                    "Debt management",
                    "Understanding credit",
                    "Consumer awareness",
                    "Retirement planning",
                ]
            },
            {
                id: 333,
                name: "Stock Options Trading 101",
                price: 150,
                duration: "1 hour",
                description: "Get introduced into the world of trading. You’ll learn the fundamental concept and principles of trading.",
                whatToLearn: [
                    "Basics of financial market",
                    "Trading terminology",
                    "Type of orders",
                    "Trading psychology",
                    "Technical analysis",
                ]
            },
            {
                id: 34,
                name: "Stock Options Trading 201",
                price: 300,
                duration: "2 hour",
                description: "Learn how to speculate on price movements, hedge against potential loss and generate income.",
                whatToLearn: [
                    "Basic options",
                    "Option pricing & valuation",
                    "Market analysis",
                    "Options trading platforms",
                    "Real life example & case studies",
                ]
            },
            
            {
                id: 35,
                name: "Stock Market Psychology",
                price: 100,
                duration: "45 minutes",
                description: "Get insight on emotions, behaviour and mindset of investors and traders in the financial markets.",
                whatToLearn: [
                    "Investor behaviour",
                    "Market cycles",
                    "Sentiment analysis",
                    "Crowd psychology",
                    "Behavioural finance",
                ]
            },
            {
                id: 36,
                name: "Charts Reading 101",
                price: 150,
                duration: "1 hour",
                description: "You will be taught the practice of analyzing & interpreting graphical representations of data to gain insight into trends, patterns & relationships.",
                whatToLearn: [
                    "Chart types",
                    "Trend analysis",
                    "Support & resistance level",
                    "Chart patterns",
                ]
            },
            {
                id: 37,
                name: "Advanced Charts Reading 201",
                price: 300,
                duration: "1 hour 30 minutes",
                description: "You will be taught the advanced practice of analyzing & interpreting graphical representations of data to gain insight into trends, patterns & relationships.",
                whatToLearn: [
                    "Volume analysis",
                    "Indicators & oscillators",
                    "Timeframes",
                    "Risk management",
                ]
            },
            {
                id: 38,
                name: "Fundamental of Crypto Trading",
                price: 150,
                duration: "1 hour 30 minutes",
                description: "You will be taught the nitty gritty of buying and selling of digital currency.",
                whatToLearn: [
                    "Basics of cryptocurrency",
                    "Technical analysis",
                    "Trading strategies",
                ]
            },
            {
                id: 39,
                name: "Forex Trading",
                price: 100,
                duration: "1 hour 30 minutes",
                description: "Understand the buying and selling of different currencies across countries.",
                whatToLearn: [
                    "Fundamentals of forex market",
                    "Currency pairs",
                    "Economic indicators",
                    "Global events",
                ]
            },
        ],
        
        price: 1000
    },
    // {
    //     id: 4,
    //     image: drone,
    //     courseName: "Drone Tech",
    //     intro: "Complete Drone Technology Mastery",
    //     description: "Learn drone tech at the forefront with our complete course.",
    //     whatToLearn: [
    //         "Introductions to drones & their components",
    //         "Safety & regulations",
    //         "Flight principles & maneuvers",
    //         "Drone data collection & analysis",
    //         "MaIntenance & troubleshooting",
    //         "Programming & automation",
    //     ],
    //     price: 100
    // },
    {
        id: 5,
        image: data,
        courseName: "Data",
        intro: "A Comprehensive Data Analysis Course",
        description: "A step by step guide to inspecting, cleaning, transforming and modeling data",
        whatToLearn: [
            "Excel  fundamentals",
            "Power BI",
            "SQL",
            "Programming & automation",
        ],
        price: 500
    },
    // {
    //     id: 6,
    //     image: videography,
    //     courseName: "Videography",
    //     intro: "Complete Mastery of Videography",
    //     description: "Learn the perfect way of planning, capturing and editing  clear and beautiful videos",
    //     whatToLearn: [
    //         "Camera basics & settings",
    //         "Composition & framing techniques",
    //         "Lighting techniques for video",
    //         "Color grading & correction<",
    //         "Cinematic techniques & visual effects",
    //         "Storytelling through visuals",
    //         "Shot types  & camera movements",
    //         "Video editing & post production",
    //     ],
    //     price: 100
    // },
    // {
    //     id: 7,
    //     image: photography,
    //     courseName: "Photography",
    //     intro: "The Perfect Approach to  Capturing",
    //     description: "Everything you need to know on how to capture and create images",
    //     whatToLearn: [
    //         "Camera basics & settings",
    //         "Exposure & understanding light",
    //         "Composition & framing techniques",
    //         "Studio  lighting & portrait setups",
    //         "Landscape & nature photography",
    //         "Video editing & post production",
    //         "Understanding different lenses & their effects",
    //     ],
    //     price: 100,
    // },
    {
        id: 8,
        image: mentorship,
        courseName: "Educational Consulting",
        intro: "Step by step guide to scholarships & more",
        description: "Everything you need to know on how to strategically apply for scholarships & getting into advance education like a masters or a phd program.",
        whatToLearn: [
            "Effective study techniques",
            "Time management",
            "Goal setting",
            "Career exploration",
            "College admissions & lots more",
            "1 hour 30 minutes consultation"
        ],
        price: 1000,
    },
]