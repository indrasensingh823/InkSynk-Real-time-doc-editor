import React, { useRef, useEffect, useState } from 'react';
import Quill from 'quill';
import html2pdf from 'html2pdf.js';
import 'quill/dist/quill.snow.css';
import '../styles/Templates.css';
import Sidebar from '../components/Sidebar';


const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ color: [] }, { background: [] }],
  ['link', 'image'],
  ['clean'],
];

const templates = [
 {
  name: "Professional Resume",
  content: { ops: [
    // Header Section
    { insert: "RAJESH KUMAR\n", attributes: { bold: true, size: "28px", align: "center", color: "#2c3e50" } },
    { insert: "Digital Marketing Specialist\n", attributes: { italic: true, size: "18px", align: "center", color: "#7f8c8d" } },
    { insert: "123 Marketing Ave, Mumbai 400001 | rajesh.kumar@email.com | (+91) 98765-43210 | linkedin.com/in/rajeshkumar\n", attributes: { align: "center", color: "#555555" } },
    { insert: "\n", attributes: { divider: true } },
    
    // Professional Summary
    { insert: "PROFESSIONAL PROFILE\n", attributes: { header: 2, underline: true, color: "#2c3e50" } },
    { insert: "Performance-driven digital marketer with 6+ years of experience developing and executing data-driven marketing campaigns. Specialized in SEO, content marketing, and social media strategy with proven success in increasing brand visibility and customer acquisition. Certified Google Ads and Analytics professional with strong analytical skills and creative problem-solving approach.\n" },
    
    // Core Competencies
    { insert: "\nCORE COMPETENCIES\n", attributes: { header: 2, underline: true, color: "#2c3e50" } },
    { insert: "• Digital Strategy Development • SEO/SEM • Social Media Marketing\n• Content Marketing • Google Analytics • Email Campaigns\n• Conversion Optimization • Market Research • Budget Management\n" },
    
    // Professional Experience
    { insert: "\nPROFESSIONAL EXPERIENCE\n", attributes: { header: 2, underline: true, color: "#2c3e50" } },
    
    { insert: "Senior Digital Marketing Manager\n", attributes: { bold: true } },
    { insert: "TechSolutions India, Mumbai | Jan 2021 - Present\n", attributes: { italic: true, color: "#555555" } },
    { insert: "• Spearheaded digital transformation initiative resulting in 40% increase in online sales\n• Managed annual marketing budget of ₹50L while delivering 25% cost reduction\n• Led team of 8 marketing professionals across SEO, content, and social media\n• Implemented marketing automation system improving lead conversion by 35%\n" },
    
    { insert: "\nDigital Marketing Specialist\n", attributes: { bold: true } },
    { insert: "BrandUp Consultants, Delhi | Aug 2018 - Dec 2020\n", attributes: { italic: true, color: "#555555" } },
    { insert: "• Developed and executed SEO strategy increasing organic traffic by 150%\n• Managed PPC campaigns with average 5:1 ROI across client portfolio\n• Created content calendar that improved social media engagement by 80%\n" },
    
    // Education
    { insert: "\nEDUCATION\n", attributes: { header: 2, underline: true, color: "#2c3e50" } },
    { insert: "MBA in Digital Marketing\n", attributes: { bold: true } },
    { insert: "Indian Institute of Management, Bangalore | 2018\n", attributes: { color: "#555555" } },
    { insert: "BBA in Marketing\n", attributes: { bold: true } },
    { insert: "University of Delhi | 2016\n", attributes: { color: "#555555" } },
    
    // Certifications
    { insert: "\nCERTIFICATIONS\n", attributes: { header: 2, underline: true, color: "#2c3e50" } },
    { insert: "• Google Ads Certification | 2023\n• HubSpot Content Marketing Certified | 2022\n• Facebook Blueprint Certification | 2021\n" },
    
    // Technical Skills
    { insert: "\nTECHNICAL SKILLS\n", attributes: { header: 2, underline: true, color: "#2c3e50" } },
    { insert: "• Tools: Google Analytics, SEMrush, HubSpot, MailChimp, Hootsuite\n• Platforms: WordPress, Shopify, Facebook Ads Manager, Google Ads\n• Languages: HTML/CSS (Basic), SQL (Intermediate)\n" },
    
    // Achievements
    { insert: "\nKEY ACHIEVEMENTS\n", attributes: { header: 2, underline: true, color: "#2c3e50" } },
    { insert: "• Awarded 'Digital Marketer of the Year' by Indian Marketing Association (2023)\n• Recognized for 'Best ROI Campaign' at National Digital Marketing Awards (2022)\n• Featured speaker at Digital Marketing Summit Mumbai (2021, 2022)\n" }
  ]}
},
  {
    name: "Report",
    content: { ops: [
      { insert: "Quarterly Sales Performance Report Q2 2025\n", attributes: { header: 1, align: "center", bold: true } },
      { insert: "Prepared by: Sarah Johnson, Sales Director\n", attributes: { italic: true, align: "center", color: "#666666" } },
      { insert: "\n1. EXECUTIVE SUMMARY\n", attributes: { header: 2, underline: true } },
      { insert: "Q2 2025 showed 15% growth in overall sales compared to Q1, exceeding projections by 5%. The Western region outperformed with 22% growth, while new product lines accounted for 35% of total revenue.\n" },
      { insert: "\n2. SALES BREAKDOWN\n", attributes: { header: 2, underline: true } },
      { insert: "2.1 Regional Performance\n", attributes: { header: 3 } },
      { insert: "• West: $1.2M (+22%)\n• East: $950K (+12%)\n• South: $780K (+8%)\n• North: $1.1M (+18%)\n" },
      { insert: "\n3. RECOMMENDATIONS\n", attributes: { header: 2, underline: true } },
      { insert: "• Increase marketing budget for underperforming regions\n• Expand training for new product sales\n• Implement CRM upgrades to improve tracking\n" }
    ]}
  },
  {
    name: "Letter",
    content: { ops: [
      { insert: "John Doe\n123 Main Street\nNew York, NY 10001\nMay 23, 2025\n", attributes: { align: "right" } },
      { insert: "\nDear Hiring Manager,\n" },
      { insert: "\nI am writing to express my interest in the Marketing Director position at XYZ Corporation as advertised on your company website. With over 8 years of progressive experience in marketing leadership roles, I am confident in my ability to contribute to your team's success.\n" },
      { insert: "\nIn my current role at ABC Company, I have successfully led a team of 12 marketing professionals, developed award-winning campaigns, and consistently exceeded revenue targets. My expertise in digital transformation and data-driven marketing strategies aligns perfectly with XYZ Corporation's innovative approach.\n" },
      { insert: "\nI would welcome the opportunity to discuss how my skills and experience can benefit your organization. Please find my resume attached for your review. I am available for an interview at your convenience and can be reached at (123) 456-7890 or john.doe@email.com.\n" },
      { insert: "\nThank you for your time and consideration. I look forward to your response.\n" },
      { insert: "\nSincerely,\n\n", attributes: { align: "left" } },
      { insert: "John Doe\n", attributes: { bold: true } }
    ]}
  },
  {
    name: "Invoice",
    content: { ops: [
      { insert: "INVOICE #INV-2025-00523\n", attributes: { header: 1, bold: true, underline: true } },
      { insert: "\nFrom:\n", attributes: { bold: true } },
      { insert: "ABC Services Inc.\n123 Business Rd.\nNew York, NY 10001\nPhone: (123) 456-7890\n", attributes: { color: "#555555" } },
      { insert: "\nTo:\n", attributes: { bold: true } },
      { insert: "XYZ Corporation\n456 Client Ave.\nChicago, IL 60601\nAttn: Accounts Payable\n", attributes: { color: "#555555" } },
      { insert: "\nInvoice Date: May 23, 2025\nDue Date: June 7, 2025\n", attributes: { bold: true } },
      { insert: "\nDescription of Services\n", attributes: { header: 2 } },
      { insert: "1. Website Redesign Project\n", attributes: { bold: true } },
      { insert: "• Homepage design\n• 5 product pages\n• CMS integration\n", attributes: { color: "#555555" } },
      { insert: "2. SEO Optimization Package\n", attributes: { bold: true } },
      { insert: "• Keyword research\n• On-page optimization\n• Monthly report\n", attributes: { color: "#555555" } },
      { insert: "\nSubtotal: $3,500.00\nTax (8%): $280.00\nTOTAL DUE: $3,780.00\n", attributes: { bold: true } },
      { insert: "\nPayment Terms: Net 15 days\nPlease make checks payable to ABC Services Inc.\n", attributes: { italic: true } }
    ]}
  },
  {
    name: "Meeting Notes",
    content: { ops: [
      { insert: "PROJECT KICKOFF MEETING NOTES\n", attributes: { header: 1, align: "center", bold: true } },
      { insert: "Date: May 23, 2025 | Time: 2:00-3:30 PM | Location: Conference Room A\n", attributes: { align: "center", color: "#666666" } },
      { insert: "\nATTENDEES\n", attributes: { header: 2, underline: true } },
      { insert: "• John Smith (Project Manager)\n• Sarah Johnson (Design Lead)\n• Michael Brown (Developer)\n• Emily Davis (QA)\n• Robert Wilson (Client)\n" },
      { insert: "\nAGENDA ITEMS\n", attributes: { header: 2, underline: true } },
      { insert: "1. Project Overview\n", attributes: { bold: true } },
      { insert: "- Client presented business objectives\n- Timeline reviewed: Launch target Sept 1\n- Budget confirmed at $75K\n" },
      { insert: "\n2. Key Decisions\n", attributes: { header: 2, underline: true } },
      { insert: "- Approved color scheme and branding guidelines\n- Agreed on using React for frontend development\n- Set weekly status meeting every Monday at 10AM\n" },
      { insert: "\n3. Action Items\n", attributes: { header: 2, underline: true } },
      { insert: "- Sarah to deliver wireframes by May 30 (Owner: Sarah)\n- Michael to setup development environment (Owner: Michael)\n- John to send meeting notes and project charter (Owner: John)\n" },
      { insert: "\nNEXT MEETING\n", attributes: { header: 2, underline: true } },
      { insert: "May 30, 2025 at 2:00 PM - Design Review\n" }
    ]}
  },
  {
    name: "Project Proposal",
    content: { ops: [
      { insert: "PROJECT PROPOSAL\n", attributes: { header: 1, bold: true, align: "center", color: "#2c3e50" } },
      { insert: "Prepared for: Client Name\n", attributes: { italic: true, align: "center" } },
      { insert: "Prepared by: Your Company\nDate: " + new Date().toLocaleDateString() + "\n", attributes: { align: "center", color: "#555555" } },
      { insert: "\n1. EXECUTIVE SUMMARY\n", attributes: { header: 2, underline: true } },
      { insert: "This proposal outlines the plan to develop a comprehensive e-commerce website for Client Name. The project will include UI/UX design, backend development, and integration with payment gateways, to be completed within 12 weeks.\n" },
      { insert: "\n2. PROJECT SCOPE\n", attributes: { header: 2, underline: true } },
      { insert: "• Responsive website design\n• Product catalog system\n• User authentication\n• Payment gateway integration\n• Admin dashboard\n" },
      { insert: "\n3. TIMELINE\n", attributes: { header: 2, underline: true } },
      { insert: "Phase 1: Discovery (2 weeks)\nPhase 2: Design (3 weeks)\nPhase 3: Development (5 weeks)\nPhase 4: Testing (2 weeks)\n" },
      { insert: "\n4. BUDGET\n", attributes: { header: 2, underline: true } },
      { insert: "Total Project Cost: ₹5,00,000\nBreakdown:\n• Design: ₹1,20,000\n• Development: ₹3,00,000\n• Testing: ₹80,000\n" }
    ]}
  },
  {
    name: "Job Description",
    content: { ops: [
      { insert: "SOFTWARE ENGINEER JOB DESCRIPTION\n", attributes: { header: 1, bold: true, align: "center" } },
      { insert: "Location: Bengaluru | Department: Engineering | Type: Full-time\n", attributes: { align: "center", color: "#555555" } },
      { insert: "\nJOB PURPOSE\n", attributes: { header: 2, underline: true } },
      { insert: "We are seeking a skilled Software Engineer to develop high-quality software solutions. The ideal candidate will have 3+ years of experience in full-stack development and a passion for creating scalable applications.\n" },
      { insert: "\nKEY RESPONSIBILITIES\n", attributes: { header: 2, underline: true } },
      { insert: "• Design and implement software applications\n• Write clean, maintainable code\n• Collaborate with product team\n• Troubleshoot and debug applications\n• Participate in code reviews\n" },
      { insert: "\nREQUIREMENTS\n", attributes: { header: 2, underline: true } },
      { insert: "• Bachelor's degree in Computer Science\n• 3+ years software development experience\n• Proficiency in JavaScript/TypeScript\n• Experience with React and Node.js\n• Knowledge of database systems\n" },
      { insert: "\nPREFERRED QUALIFICATIONS\n", attributes: { header: 2, underline: true } },
      { insert: "• Experience with cloud platforms (AWS/Azure)\n• Familiarity with DevOps practices\n• Contributions to open-source projects\n" }
    ]}
  },
  {
    name: "Press Release",
    content: { ops: [
      { insert: "FOR IMMEDIATE RELEASE\n", attributes: { bold: true, align: "center" } },
      { insert: "\nTechStart Launches Revolutionary AI Platform\n", attributes: { header: 1, align: "center" } },
      { insert: "Bengaluru, India - " + new Date().toLocaleDateString() + " - ", attributes: { italic: true } },
      { insert: "TechStart today announced the launch of NovaAI, a groundbreaking artificial intelligence platform that transforms business operations.\n" },
      { insert: "\n[Company Name], a leader in enterprise AI solutions, has developed NovaAI to help businesses automate complex processes with 95% accuracy. The platform combines machine learning with intuitive interfaces to deliver immediate value.\n" },
      { insert: "\n\"This launch represents a major milestone in making AI accessible to all businesses,\" said [CEO Name], Founder and CEO of TechStart. \"NovaAI democratizes artificial intelligence by removing technical barriers.\"\n" },
      { insert: "\nKEY FEATURES:\n", attributes: { bold: true } },
      { insert: "• No-code AI model builder\n• Pre-built industry templates\n• Real-time analytics dashboard\n• Enterprise-grade security\n" },
      { insert: "\nNovaAI is available immediately starting at ₹50,000/month. For more information, visit www.techstart.com/novaai.\n" },
      { insert: "\nAbout TechStart:\n", attributes: { bold: true } },
      { insert: "Founded in 2018, TechStart develops AI solutions for enterprises. Headquartered in Bengaluru, the company serves clients across 15 countries.\n" },
      { insert: "\nMedia Contact:\n", attributes: { bold: true } },
      { insert: "Priya Sharma\nMarketing Director\ncontact@techstart.com\n+91 9876543210\n" }
    ]}
  },
  {
    name: "Business Plan",
    content: { ops: [
      { insert: "BUSINESS PLAN\n", attributes: { header: 1, bold: true, align: "center" } },
      { insert: "GreenFarm Organics\n", attributes: { size: "20px", align: "center" } },
      { insert: "Prepared: " + new Date().toLocaleDateString() + "\n", attributes: { align: "center", color: "#555555" } },
      { insert: "\n1. EXECUTIVE SUMMARY\n", attributes: { header: 2, underline: true } },
      { insert: "GreenFarm Organics will establish an organic food delivery service in Mumbai, sourcing directly from local farmers. We project ₹2 crore revenue in Year 1 with 25% margins.\n" },
      { insert: "\n2. BUSINESS DESCRIPTION\n", attributes: { header: 2, underline: true } },
      { insert: "• Mission: Connect health-conscious consumers with certified organic produce\n• Legal Structure: Private Limited Company\n• Location: Mumbai with delivery across 20km radius\n" },
      { insert: "\n3. MARKET ANALYSIS\n", attributes: { header: 2, underline: true } },
      { insert: "• Target Market: Urban professionals aged 25-45\n• Market Size: ₹500 crore annually in Mumbai\n• Trends: 30% annual growth in organic food demand\n" },
      { insert: "\n4. OPERATIONS PLAN\n", attributes: { header: 2, underline: true } },
      { insert: "• Supplier network of 15 certified farms\n• 5,000 sq ft warehouse\n• Fleet of 10 refrigerated delivery vehicles\n• Mobile app for orders\n" },
      { insert: "\n5. FINANCIAL PROJECTIONS\n", attributes: { header: 2, underline: true } },
      { insert: "Year 1:\n• Revenue: ₹2 crore\n• Expenses: ₹1.5 crore\n• Profit: ₹50 lakh\n\nYear 2:\n• Revenue: ₹3.5 crore\n• Expenses: ₹2.2 crore\n• Profit: ₹1.3 crore\n" }
    ]}
  },
  {
    name: "Product Specification",
    content: { ops: [
      { insert: "PRODUCT SPECIFICATION DOCUMENT\n", attributes: { header: 1, bold: true, align: "center" } },
      { insert: "Product Name: SmartHome Hub\nVersion: 2.0\n", attributes: { align: "center", color: "#555555" } },
      { insert: "\n1. OVERVIEW\n", attributes: { header: 2, underline: true } },
      { insert: "The SmartHome Hub is a central control system for home automation devices, compatible with 100+ IoT devices. Key features include voice control, energy monitoring, and AI-based automation.\n" },
      { insert: "\n2. TECHNICAL SPECIFICATIONS\n", attributes: { header: 2, underline: true } },
      { insert: "• Dimensions: 120mm × 120mm × 30mm\n• Weight: 250g\n• Connectivity: WiFi 6, Bluetooth 5.2, Zigbee 3.0\n• Processor: Quad-core 1.8GHz\n• Memory: 2GB RAM, 16GB storage\n" },
      { insert: "\n3. FEATURES\n", attributes: { header: 2, underline: true } },
      { insert: "• Unified control for lights, security, HVAC\n• Voice assistant integration\n• Energy usage analytics\n• Geofencing automation\n• Child safety modes\n" },
      { insert: "\n4. COMPATIBILITY\n", attributes: { header: 2, underline: true } },
      { insert: "• Works with Amazon Alexa, Google Assistant\n• Supports Philips Hue, Nest, Ring, and other major brands\n• Open API for developer integration\n" },
      { insert: "\n5. PACKAGE CONTENTS\n", attributes: { header: 2, underline: true } },
      { insert: "• SmartHome Hub unit\n• Power adapter\n• Ethernet cable\n• Quick start guide\n• 1-year warranty card\n" }
    ]}
  },
  {
    name: "Leave Application",
    content: { ops: [
      { insert: "Leave Application\n", attributes: { header: 1, bold: true, align: "center" } },
      { insert: "\nTo,\nThe Manager\n[Company Name]\n[Company Address]\n", attributes: { color: "#555555" } },
      { insert: "\nDate: " + new Date().toLocaleDateString() + "\n", attributes: { align: "right" } },
      { insert: "\nSubject: Application for Leave\n", attributes: { bold: true } },
      { insert: "\nRespected Sir/Madam,\n" },
      { insert: "\nI am writing to formally request leave from [start date] to [end date] (total [number] days) due to [reason: personal/medical/family].\n" },
      { insert: "\nDuring my absence, I have arranged for [colleague's name] to handle my responsibilities. All pending work will be completed before my leave begins.\n" },
      { insert: "\nI have attached the necessary documents [medical certificate/other] for your reference. Kindly approve my leave request.\n" },
      { insert: "\nThank you for your consideration.\n" },
      { insert: "\nSincerely,\n[Your Name]\n[Employee ID]\n[Department]\n[Contact Number]" }
    ]}
  },
  {
    name: "Performance Appraisal",
    content: { ops: [
      { insert: "EMPLOYEE PERFORMANCE APPRAISAL\n", attributes: { header: 1, bold: true, align: "center" } },
      { insert: "\nEmployee Name: __________________\nDesignation: __________________\nDepartment: __________________\nAppraisal Period: April 2024 - March 2025\n", attributes: { color: "#555555" } },
      { insert: "\n1. KEY RESPONSIBILITIES\n", attributes: { header: 2, underline: true } },
      { insert: "• _______________________________________________________\n• _______________________________________________________\n• _______________________________________________________\n" },
      { insert: "\n2. ACHIEVEMENTS\n", attributes: { header: 2, underline: true } },
      { insert: "• _______________________________________________________\n• _______________________________________________________\n• _______________________________________________________\n" },
      { insert: "\n3. SKILLS ASSESSMENT (Rating: 1-5)\n", attributes: { header: 2, underline: true } },
      { insert: "• Technical Skills: ____\n• Communication: ____\n• Teamwork: ____\n• Leadership: ____\n• Problem Solving: ____\n" },
      { insert: "\n4. TRAINING NEEDS\n", attributes: { header: 2, underline: true } },
      { insert: "• _______________________________________________________\n• _______________________________________________________\n" },
      { insert: "\n5. OVERALL RATING: _________\n", attributes: { header: 2, underline: true } },
      { insert: "\nAppraiser's Comments:\n_______________________________________________________\n\nEmployee's Comments:\n_______________________________________________________\n" }
    ]}
  },
  {
    name: "Quotation",
    content: { ops: [
      { insert: "QUOTATION\n", attributes: { header: 1, bold: true, align: "center" } },
      { insert: "\nQuotation No: QTN-2025-001\nDate: " + new Date().toLocaleDateString() + "\n", attributes: { align: "right" } },
      { insert: "\nTo:\n[Client Name]\n[Company Name]\n[Address]\n", attributes: { color: "#555555" } },
      { insert: "\nDear Sir/Madam,\n" },
      { insert: "\nThank you for your inquiry. We are pleased to quote the following:\n" },
      { insert: "\n1. ITEM DESCRIPTION\n", attributes: { header: 2, underline: true } },
      { insert: "• Product A - ₹25,000 per unit (Qty: 5) = ₹1,25,000\n• Service B - ₹15,000 per month (3 months) = ₹45,000\n• Maintenance - ₹10,000 (one-time) = ₹10,000\n" },
      { insert: "\n2. TERMS & CONDITIONS\n", attributes: { header: 2, underline: true } },
      { insert: "• Prices inclusive of GST @18%\n• Delivery within 15 days of order confirmation\n• Payment: 50% advance, 50% on delivery\n• Validity: 30 days from quote date\n" },
      { insert: "\nTotal Amount: ₹1,80,000 (Rupees One Lakh Eighty Thousand Only)\n" },
      { insert: "\nWe look forward to your valued order. Please feel free to contact us for any clarification.\n" },
      { insert: "\nRegards,\n[Your Name]\n[Company Name]\n[Contact Details]\n" }
    ]}
  },
  {
    name: "Complaint Letter",
    content: { ops: [
      { insert: "COMPLAINT LETTER\n", attributes: { header: 1, bold: true, align: "center" } },
      { insert: "\n[Your Name]\n[Your Address]\n[City, PIN Code]\n[Email]\n[Date]\n", attributes: { color: "#555555" } },
      { insert: "\nTo,\nThe Customer Service Manager\n[Company Name]\n[Company Address]\n" },
      { insert: "\nSubject: Complaint Regarding [Product/Service]\n", attributes: { bold: true } },
      { insert: "\nDear Sir/Madam,\n" },
      { insert: "\nI am writing to formally complain about [product/service] I purchased/received on [date]. The invoice/bill number is [number].\n" },
      { insert: "\nThe issues I am facing are:\n• _______________________________________________________\n• _______________________________________________________\n• _______________________________________________________\n" },
      { insert: "\nThis has caused me considerable inconvenience as [explain impact]. I have attached copies of relevant documents for your reference.\n" },
      { insert: "\nI request you to [state what you want - replacement/refund/repair] at the earliest. Please resolve this matter within [time period] or I will be forced to take further action.\n" },
      { insert: "\nI look forward to your prompt response. You may contact me at [phone number] or [email].\n" },
      { insert: "\nSincerely,\n[Your Name]\n[Contact Information]" }
    ]}
  },
  {
    name: "Training Proposal",
    content: { ops: [
      { insert: "TRAINING PROPOSAL\n", attributes: { header: 1, bold: true, align: "center" } },
      { insert: "\nPrepared for: [Client Organization]\nPrepared by: [Your Company]\nDate: " + new Date().toLocaleDateString() + "\n", attributes: { align: "center", color: "#555555" } },
      { insert: "\n1. INTRODUCTION\n", attributes: { header: 2, underline: true } },
      { insert: "This proposal outlines the [training program name] designed to enhance your team's skills in [specific area]. The program will be customized to meet your organizational needs and delivered by our expert trainers.\n" },
      { insert: "\n2. TRAINING OBJECTIVES\n", attributes: { header: 2, underline: true } },
      { insert: "• Improve ________________________________________________\n• Develop ________________________________________________\n• Enhance ________________________________________________\n" },
      { insert: "\n3. PROGRAM DETAILS\n", attributes: { header: 2, underline: true } },
      { insert: "• Duration: ___ days (___ hours per day)\n• Mode: Online/Classroom/Blended\n• Batch Size: 15-20 participants\n• Methodology: Interactive sessions, case studies, exercises\n" },
      { insert: "\n4. COST STRUCTURE\n", attributes: { header: 2, underline: true } },
      { insert: "• Training Fee: ₹______ per participant\n• Total for ___ participants: ₹______\n• Includes: Training materials, certificate, trainer fees\n" },
      { insert: "\n5. ABOUT OUR COMPANY\n", attributes: { header: 2, underline: true } },
      { insert: "[Your company] is a leading training provider with 10+ years experience. We have trained 5000+ professionals across various industries with 95% satisfaction rate.\n" },
      { insert: "\nWe look forward to partnering with you. Please contact us to discuss customization options.\n" }
    ]}
  },
   {
    name: "RTI Application",
    content: { ops: [
      { insert: "आवेदन सूचना का अधिकार अधिनियम, 2005 के तहत\n", attributes: { bold: true, align: "center" } },
      { insert: "\nTo,\nलोक सूचना अधिकारी\n[विभाग/कार्यालय का नाम]\n[पता]\n", attributes: { color: "#555555" } },
      { insert: "\nविषय: सूचना के लिए आवेदन\n", attributes: { bold: true } },
      { insert: "\nमहोदय,\n" },
      { insert: "\n1. मैं निम्नलिखित सूचना आपके विभाग/कार्यालय से प्राप्त करना चाहता/चाहती हूं:\n" },
      { insert: "• _______________________________________________________\n• _______________________________________________________\n• _______________________________________________________\n" },
      { insert: "\n2. आवेदन शुल्क ₹10/- निम्नलिखित माध्यम से जमा किया गया है:\n(क) नकद (रसीद संख्या ______)\n(ख) डिमांड ड्राफ्ट/बैंकर्स चेक संख्या ______\n" },
      { insert: "\n3. आवेदक का विवरण:\nनाम: __________________\nपता: __________________\nमोबाइल नंबर: __________________\nईमेल: __________________\n" },
      { insert: "\nदिनांक: " + new Date().toLocaleDateString('hi-IN') + "\n\nहस्ताक्षर: __________________\n" }
    ]}
  },
  {
    name: "Grievance Redressal",
    content: { ops: [
      { insert: "शिकायत निवारण आवेदन\n", attributes: { bold: true, align: "center" } },
      { insert: "\nTo,\nशिकायत निवारण अधिकारी\n[विभाग/कार्यालय का नाम]\n[पता]\n", attributes: { color: "#555555" } },
      { insert: "\nविषय: शिकायत निवारण हेतु आवेदन\n", attributes: { bold: true } },
      { insert: "\nमहोदय,\n" },
      { insert: "\nमैं निम्नलिखित शिकायत दर्ज कराना चाहता/चाहती हूं:\n" },
      { insert: "\n1. शिकायत का विवरण:\n_______________________________________________________\n_______________________________________________________\n" },
      { insert: "\n2. शिकायत से संबंधित दस्तावेज संलग्न हैं:\n(क) __________________\n(ख) __________________\n" },
      { insert: "\n3. आवेदक का विवरण:\nनाम: __________________\nपता: __________________\nआधार नंबर: __________________\nमोबाइल नंबर: __________________\n" },
      { insert: "\nदिनांक: " + new Date().toLocaleDateString('hi-IN') + "\n\nहस्ताक्षर: __________________\n" }
    ]}
  },
  {
    name: "Income Certificate",
    content: { ops: [
      { insert: "आय प्रमाण पत्र हेतु आवेदन\n", attributes: { bold: true, align: "center" } },
      { insert: "\nTo,\nतहसीलदार/रेवेन्यू अधिकारी\n[कार्यालय का नाम]\n[जिला]\n", attributes: { color: "#555555" } },
      { insert: "\nविषय: आय प्रमाण पत्र जारी करने हेतु आवेदन\n", attributes: { bold: true } },
      { insert: "\nमहोदय,\n" },
      { insert: "\nमैं निवेदन करता/करती हूं कि मेरा आय प्रमाण पत्र जारी किया जाए। मेरा विवरण निम्नलिखित है:\n" },
      { insert: "\n1. आवेदक का नाम: __________________\n2. पिता/पति का नाम: __________________\n3. पता: __________________\n4. आधार नंबर: __________________\n5. मोबाइल नंबर: __________________\n" },
      { insert: "\nवार्षिक आय का विवरण:\nस्रोत | आय (₹)\n__________________ | __________________\n__________________ | __________________\n" },
      { insert: "\nसंलग्न दस्तावेज:\n1. आधार कार्ड की प्रति\n2. पते का प्रमाण\n3. आय का प्रमाण\n" },
      { insert: "\nदिनांक: " + new Date().toLocaleDateString('hi-IN') + "\n\nहस्ताक्षर: __________________\n" }
    ]}
  },
  {
    name: "Pension Application",
    content: { ops: [
      { insert: "पेंशन आवेदन पत्र\n", attributes: { bold: true, align: "center" } },
      { insert: "\nTo,\nकार्यालय अध्यक्ष\n[कार्यालय का नाम]\n[विभाग]\n[पता]\n", attributes: { color: "#555555" } },
      { insert: "\nविषय: पेंशन स्वीकृत करने हेतु आवेदन\n", attributes: { bold: true } },
      { insert: "\nमहोदय,\n" },
      { insert: "\nमैं [नाम] जो कि आपके विभाग में [पदनाम] के रूप में कार्यरत था/थी, सेवानिवृत्ति/अवकाश ग्रहण करने जा रहा/रही हूं। मैं निम्नलिखित पेंशन योजना के तहत पेंशन प्राप्त करना चाहता/चाहती हूं:\n" },
      { insert: "\n1. सेवानिवृत्ति तिथि: __________________\n2. पेंशन योजना: __________________\n3. बैंक खाता विवरण:\n   • बैंक नाम: __________________\n   • खाता संख्या: __________________\n   • IFSC कोड: __________________\n" },
      { insert: "\nसंलग्न दस्तावेज:\n1. सेवानिवृत्ति आदेश की प्रति\n2. बैंक पासबुक की प्रति\n3. आधार कार्ड की प्रति\n4. पासपोर्ट साइज फोटो (2 नं.)\n" },
      { insert: "\nदिनांक: " + new Date().toLocaleDateString('hi-IN') + "\n\nहस्ताक्षर: __________________\nसंपर्क नंबर: __________________\n" }
    ]}
  },
  {
    name: "Tender Document",
    content: { ops: [
      { insert: "निविदा दस्तावेज\n", attributes: { bold: true, align: "center" } },
      { insert: "\nनिविदा संख्या: __________________\nनिविदा शीर्षक: __________________\nविभाग: __________________\n", attributes: { color: "#555555" } },
      { insert: "\n1. परिचय\n", attributes: { header: 2, underline: true } },
      { insert: "यह निविदा दस्तावेज [कार्य/सामग्री का विवरण] के लिए जारी किया जा रहा है। निविदा की अंतिम तिथि [तिथि] है और खुलने की तिथि [तिथि] है।\n" },
      { insert: "\n2. कार्य का विवरण\n", attributes: { header: 2, underline: true } },
      { insert: "• _______________________________________________________\n• _______________________________________________________\n• _______________________________________________________\n" },
      { insert: "\n3. पात्रता मानदंड\n", attributes: { header: 2, underline: true } },
      { insert: "• कम से कम 5 वर्ष का अनुभव\n• वित्तीय स्थिरता का प्रमाण\n• समान कार्य का पूर्व अनुभव\n" },
      { insert: "\n4. दस्तावेजी आवश्यकताएं\n", attributes: { header: 2, underline: true } },
      { insert: "• पंजीकरण प्रमाणपत्र\n• जीएसटी रजिस्ट्रेशन\n• पिछले 3 वर्षों के ऑडिटेड खाते\n• कार्य अनुभव प्रमाण\n" },
      { insert: "\n5. महत्वपूर्ण तिथियां\n", attributes: { header: 2, underline: true } },
      { insert: "• निविदा जारी होने की तिथि: __________________\n• प्रश्न पूछने की अंतिम तिथि: __________________\n• निविदा जमा करने की अंतिम तिथि: __________________\n" },
      { insert: "\nकार्यालय मुहर:\n\nहस्ताक्षर:\n[अधिकारी का नाम]\n[पदनाम]\n[विभाग]\n" }
    ]}
  },
   {
    name: "DM Complaint Letter - Public Issue",
    content: { ops: [
      { insert: "जिलाधिकारी को शिकायत पत्र\n", attributes: { bold: true, align: "center", size: "18px" } },
      { insert: "\nTo,\nश्रीमान जिलाधिकारी महोदय\n[जिला का नाम]\n[जिला मुख्यालय का पता]\n", attributes: { color: "#555555" } },
      { insert: "\nविषय: [सड़क/बिजली/पानी/सफाई] की समस्या के संबंध में शिकायत\n", attributes: { bold: true } },
      { insert: "\nमहोदय,\n" },
      { insert: "\nसविनय निवेदन है कि मैं [आपका नाम], पता - [आपका पूरा पता], आपके जिले का निवासी हूं। मैं आपका ध्यान निम्नलिखित गंभीर समस्या की ओर आकर्षित करना चाहता/चाहती हूं:\n" },
      { insert: "\n1. समस्या का विवरण:\n• _______________________________________________________\n• _______________________________________________________\n" },
      { insert: "\n2. समस्या का स्थान:\nगांव/मोहल्ला: __________________\nवार्ड नंबर: __________________\nलैंडमार्क: __________________\n" },
      { insert: "\n3. समस्या की अवधि:\nलगभग [समय अवधि] से यह समस्या चल रही है\n" },
      { insert: "\nमैंने इस संबंध में [संबंधित विभाग] से भी संपर्क किया था, लेकिन कोई समाधान नहीं हुआ। कृपया इस मामले में तुरंत कार्रवाई करने की कृपा करें।\n" },
      { insert: "\nसंलग्न दस्तावेज:\n1. समस्या की फोटो\n2. पहचान प्रमाण\n" },
      { insert: "\nदिनांक: " + new Date().toLocaleDateString('hi-IN') + "\n\nभवदीय,\n[आपका नाम]\n[मोबाइल नंबर]\n[आधार नंबर]\n" }
    ]}
  },
  {
    name: "Application to DM for Certificate",
    content: { ops: [
      { insert: "जाति/निवास प्रमाण पत्र हेतु आवेदन\n", attributes: { bold: true, align: "center", size: "18px" } },
      { insert: "\nTo,\nमाननीय जिलाधिकारी महोदय\n[जिला का नाम]\n[जिला मुख्यालय का पता]\n", attributes: { color: "#555555" } },
      { insert: "\nविषय: जाति/निवास प्रमाण पत्र जारी करने हेतु आवेदन\n", attributes: { bold: true } },
      { insert: "\nमहोदय,\n" },
      { insert: "\nसविनय निवेदन है कि मैं [आपका नाम], पुत्र/पुत्री [पिता/पति का नाम], निवासी [पूरा पता], आपके जिले का स्थायी निवासी हूं। मुझे अपने [शैक्षणिक/नौकरी] संबंधी कार्य हेतु जाति/निवास प्रमाण पत्र की आवश्यकता है।\n" },
      { insert: "\nमेरा विवरण निम्नलिखित है:\n" },
      { insert: "1. नाम: __________________\n2. पिता/पति का नाम: __________________\n3. जन्म तिथि: __________________\n4. मूल निवास: __________________\n5. आधार नंबर: __________________\n" },
      { insert: "\nसंलग्न दस्तावेज:\n1. आधार कार्ड की प्रति\n2. राशन कार्ड की प्रति\n3. पुराना प्रमाण पत्र (यदि उपलब्ध हो)\n4. पासपोर्ट साइज फोटो\n" },
      { insert: "\nअतः श्रीमान जी से विनम्र निवेदन है कि मेरा जाति/निवास प्रमाण पत्र शीघ्र जारी करने की कृपा करें।\n" },
      { insert: "\nदिनांक: " + new Date().toLocaleDateString('hi-IN') + "\n\nभवदीय,\n[आपका नाम]\n[संपर्क नंबर]\n[ईमेल आईडी]\n" }
    ]}
  },
  {
    name: "DM Application for Financial Help",
    content: { ops: [
      { insert: "आर्थिक सहायता हेतु आवेदन पत्र\n", attributes: { bold: true, align: "center", size: "18px" } },
      { insert: "\nTo,\nमाननीय जिलाधिकारी महोदय\n[जिला का नाम]\n[जिला मुख्यालय का पता]\n", attributes: { color: "#555555" } },
      { insert: "\nविषय: आर्थिक सहायता प्रदान करने हेतु आवेदन\n", attributes: { bold: true } },
      { insert: "\nमहोदय,\n" },
      { insert: "\nसविनय निवेदन है कि मैं [आपका नाम], पुत्र/पुत्री [पिता/पति का नाम], निवासी [पूरा पता], एक गरीब/विकलांग/विधवा परिवार से हूं। मेरे परिवार की आर्थिक स्थिति अत्यंत दयनीय है और [चिकित्सा/शिक्षा/आवास] के लिए मुझे तत्काल आर्थिक सहायता की आवश्यकता है।\n" },
      { insert: "\nमेरे परिवार की वार्षिक आय लगभग ₹______ है। परिवार के सदस्यों की संख्या ______ है।\n" },
      { insert: "\nमेरी समस्या का विस्तृत विवरण:\n_______________________________________________________\n_______________________________________________________\n" },
      { insert: "\nसंलग्न दस्तावेज:\n1. आय प्रमाण पत्र\n2. बैंक पासबुक की प्रति\n3. मेडिकल रिपोर्ट/फीस स्ट्रक्चर (यदि लागू हो)\n4. आधार कार्ड\n" },
      { insert: "\nअतः श्रीमान जी से विनम्र निवेदन है कि मुझे सरकारी योजना के तहत आर्थिक सहायता प्रदान करने की कृपा करें।\n" },
      { insert: "\nदिनांक: " + new Date().toLocaleDateString('hi-IN') + "\n\nभवदीय,\n[आपका नाम]\n[संपर्क नंबर]\n[बैंक खाता विवरण]\n" }
    ]}
  },
  {
    name: "Complaint to DM Against Official",
    content: { ops: [
      { insert: "कर्मचारी/अधिकारी के विरुद्ध शिकायत पत्र\n", attributes: { bold: true, align: "center", size: "18px" } },
      { insert: "\nTo,\nमाननीय जिलाधिकारी महोदय\n[जिला का नाम]\n[जिला मुख्यालय का पता]\n", attributes: { color: "#555555" } },
      { insert: "\nविषय: [विभाग/कार्यालय] के कर्मचारी/अधिकारी के दुर्व्यवहार/भ्रष्टाचार के विरुद्ध शिकायत\n", attributes: { bold: true } },
      { insert: "\nमहोदय,\n" },
      { insert: "\nसविनय निवेदन है कि मैं [आपका नाम], पता - [आपका पूरा पता], द्वारा निम्नलिखित गंभीर शिकायत [कार्यालय/विभाग] के श्री [कर्मचारी/अधिकारी का नाम], पदनाम [पदनाम] के विरुद्ध दर्ज कराई जा रही है:\n" },
      { insert: "\n1. घटना की तिथि एवं समय: __________________\n2. घटना स्थल: __________________\n3. घटना का विस्तृत विवरण:\n_______________________________________________________\n_______________________________________________________\n" },
      { insert: "\n4. मेरे द्वारा की गई कार्रवाई (यदि कोई हो):\n_______________________________________________________\n" },
      { insert: "\n5. गवाह (यदि कोई हो):\nनाम: __________________, संपर्क: __________________\nनाम: __________________, संपर्क: __________________\n" },
      { insert: "\nमैंने इस मामले में [संबंधित अधिकारी] से भी शिकायत की थी, लेकिन कोई कार्रवाई नहीं हुई। अतः आपसे अनुरोध है कि इस गंभीर मामले की जांच करके उचित कार्रवाई करने की कृपा करें।\n" },
      { insert: "\nसंलग्न दस्तावेज:\n1. सम्बंधित साक्ष्य/फोटो/ऑडियो/वीडियो\n2. पहचान प्रमाण\n" },
      { insert: "\nदिनांक: " + new Date().toLocaleDateString('hi-IN') + "\n\nभवदीय,\n[आपका नाम]\n[संपर्क नंबर]\n[आधार नंबर]\n" }
    ]}
  },
  {
    name: "Application to DM for Land Issue",
    content: { ops: [
      { insert: "भूमि संबंधी समस्या हेतु आवेदन\n", attributes: { bold: true, align: "center", size: "18px" } },
      { insert: "\nTo,\nमाननीय जिलाधिकारी महोदय\n[जिला का नाम]\n[जिला मुख्यालय का पता]\n", attributes: { color: "#555555" } },
      { insert: "\nविषय: [जमीन पर कब्जा/सीमा विवाद/अतिक्रमण] के संबंध में आवेदन\n", attributes: { bold: true } },
      { insert: "\nमहोदय,\n" },
      { insert: "\nसविनय निवेदन है कि मैं [आपका नाम], पुत्र/पुत्री [पिता/पति का नाम], निवासी [पूरा पता], अपनी भूमि खसरा नंबर [खसरा नंबर], क्षेत्रफल [क्षेत्रफल], ग्राम [ग्राम का नाम], तहसील [तहसील], में हो रही निम्नलिखित समस्या की ओर आपका ध्यान आकर्षित करना चाहता/चाहती हूं:\n" },
      { insert: "\n1. समस्या का विवरण:\n_______________________________________________________\n_______________________________________________________\n" },
      { insert: "\n2. समस्या की अवधि:\nलगभग [समय अवधि] से यह समस्या चल रही है\n" },
      { insert: "\n3. मेरे द्वारा की गई कार्रवाई:\n_______________________________________________________\n" },
      { insert: "\n4. संबंधित व्यक्ति/विभाग का विवरण (यदि लागू हो):\nनाम: __________________\nपता: __________________\n" },
      { insert: "\nमैंने इस संबंध में [तहसीलदार/पटवारी/अन्य अधिकारी] से भी संपर्क किया था, लेकिन समस्या का समाधान नहीं हुआ। अतः आपसे विनम्र निवेदन है कि इस मामले में तुरंत कार्रवाई करने की कृपा करें।\n" },
      { insert: "\nसंलग्न दस्तावेज:\n1. भूमि के कागजात\n2. खसरा-खतौनी की प्रति\n3. समस्या की फोटो\n4. पहचान प्रमाण\n" },
      { insert: "\nदिनांक: " + new Date().toLocaleDateString('hi-IN') + "\n\nभवदीय,\n[आपका नाम]\n[संपर्क नंबर]\n[आधार नंबर]\n" }
    ]}
  },
   {
    name: "In-Depth Analysis Article",
    content: { ops: [
      { insert: "Electric Vehicle Revolution in India: Challenges and Opportunities\n", attributes: { header: 1, bold: true, align: "center", color: "#2c3e50" } },
      { insert: "\nBy Dr. Ananya Patel, Auto Analyst | ", attributes: { italic: true, color: "#7f8c8d" } },
      { insert: new Date().toLocaleDateString('en-IN'), attributes: { italic: true, color: "#7f8c8d" } },
      { insert: " | 8 min read\n", attributes: { italic: true, color: "#7f8c8d" } },
      { insert: "\n", attributes: { divider: "double" } },
      { insert: "\nExecutive Summary:\n", attributes: { header: 2, underline: true } },
      { insert: "India's EV market is projected to grow at 36% CAGR through 2030. This analysis examines infrastructure gaps, policy initiatives, and emerging business models that will shape adoption.\n" },
      { insert: "\nKey Findings:\n", attributes: { bold: true } },
      { insert: "✓ 40% of 2W sales could be electric by 2030\n✓ Charging station gap: 1 per 135 EVs vs ideal 1 per 40\n✓ Battery costs dropped 18% YoY but remain 25% higher than global average\n" },
      { insert: "\n", attributes: { divider: "single" } },
      { insert: "\n1. Policy Landscape\n", attributes: { header: 2, color: "#e74c3c" } },
      { insert: "The FAME-II scheme has allocated ₹10,000 crore with notable impacts:\n" },
      { insert: "\n• Subsidy Structure:\n", attributes: { bold: true } },
      { insert: "| Vehicle Type  | Base Subsidy | Additional Incentives |\n|--------------|--------------|-----------------------|\n| 2W           | ₹15,000/kWh  | State tax rebates      |\n| 3W           | ₹10,000/kWh  | Municipal incentives   |\n| 4W           | ₹7,000/kWh   | Parking benefits       |\n" },
      { insert: "\n2. Infrastructure Challenges\n", attributes: { header: 2, color: "#e74c3c" } },
      { insert: "Our survey of 15 cities reveals:\n" },
      { insert: "\n• Charging Anxiety: 68% potential buyers cite as primary concern\n• Installation Costs: ₹2.5-5 lakh per public charger\n• Grid Capacity: Needs 15-20% upgrade in Tier 1 cities\n" },
      { insert: "\n3. Emerging Solutions\n", attributes: { header: 2, color: "#e74c3c" } },
      { insert: "Innovative approaches gaining traction:\n" },
      { insert: "\n• Battery Swapping (30% faster adoption in commercial fleets)\n• Solar-Powered Charging Hubs\n• PPP Models for Highway Corridors\n" },
      { insert: "\n", attributes: { divider: "double" } },
      { insert: "\nMethodology: ", attributes: { bold: true } },
      { insert: "Primary research with 500+ stakeholders, secondary data analysis of government reports and corporate filings.\n" },
      { insert: "\nVisual Summary:\n[Infographic: EV Adoption Roadmap 2025-2030]\n" },
      { insert: "\n#EVRevolution #SustainableMobility #AutoTech #MakeInIndia", attributes: { color: "#3498db" } }
    ]}
  },
  {
    name: "Breaking News Report",
    content: { ops: [
      { insert: "FLASH: RBI Announces 25 bps Rate Cut - First in 18 Months\n", attributes: { header: 1, bold: true, align: "center", background: "#e74c3c", color: "white" } },
      { insert: "\nBy Financial Bureau | ", attributes: { italic: true, color: "#ecf0f1" } },
      { insert: new Date().toLocaleDateString('en-IN') + " | 3:45 PM IST | Live Updates\n", attributes: { italic: true, color: "#ecf0f1" } },
      { insert: "\n", attributes: { divider: "thick" } },
      { insert: "\nMUMBAI: In a surprise move, the Reserve Bank of India's Monetary Policy Committee cut the repo rate by 25 basis points to 6.25% today. This marks the first reduction since August 2023.\n" },
      { insert: "\nKey Decisions:\n", attributes: { header: 2, background: "#f39c12" } },
      { insert: "• Repo Rate: 6.50% → 6.25%\n• Reverse Repo: 6.25% → 6.00%\n• GDP Forecast: Maintained at 7.4% for FY25\n• Inflation Projection: Lowered to 4.8% (from 5.1%)\n" },
      { insert: "\nMarket Reaction (Live):\n", attributes: { header: 2 } },
      { insert: "✓ Sensex: +587 points (1.02%)\n✓ Nifty: +172 points (1.07%)\n✓ 10-Yr Bond Yield: 7.08% → 6.92%\n✓ INR: 82.95 → 82.78/USD\n" },
      { insert: "\nGovernor's Statement:\n", attributes: { header: 2 } },
      { insert: "\"The decision reflects our assessment that inflationary pressures have moderated while growth needs support,\" said RBI Governor Shaktikanta Das in his address.\n" },
      { insert: "\nExpert Reactions:\n", attributes: { header: 2 } },
      { insert: "\n\"This dovish tilt suggests RBI is prioritizing growth amid global slowdown fears. We expect one more cut in Q4.\" - Rajiv Mehta, Yes Securities\n" },
      { insert: "\n\"Banks should transmit this quickly to home and auto loans. EMI relief coming for borrowers.\" - Naina Lal, Banking Analyst\n" },
      { insert: "\nSectoral Impact Analysis:\n", attributes: { header: 2 } },
      { insert: "1. Real Estate (+): Home loans to become cheaper\n2. Automobiles (+): Boost for vehicle financing\n3. Banks (~): NIMs may compress but credit growth positive\n4. NBFCs (+): Lower borrowing costs\n" },
      { insert: "\n", attributes: { divider: "thick" } },
      { insert: "\nNext MPC Meeting: October 4, 2025\n", attributes: { bold: true } },
      { insert: "\nLIVE UPDATES (Last refresh: 4:10 PM):\n• SBI cuts MCLR by 15 bps with immediate effect\n• HDFC Bank announces special home loan rates\n• Gold prices fall 0.8% on rate cut news\n", attributes: { background: "#f1f1f1" } },
      { insert: "\n#RBIPolicy #RateCut #Economy #Markets", attributes: { color: "#3498db" } }
    ]}
  },
   {
    name: "To-Do List",
    content: {
      ops: [
        { insert: "📌 To-Do List\n", attributes: { header: 1 } },
        { insert: "✅ Task 1:\n" },
        { insert: "✅ Task 2:\n" },
        { insert: "✅ Task 3:\n" },
        { insert: "Add your tasks here...\n" }
      ]
    }
  },
  {
    name: "Daily Journal",
    content: {
      ops: [
        { insert: "📝 Daily Journal\n", attributes: { header: 1 } },
        { insert: "Date: ", attributes: { bold: true } },
        { insert: "__________\n" },
        { insert: "Mood: ", attributes: { bold: true } },
        { insert: "__________\n" },
        { insert: "Today I experienced...\n\n" },
        { insert: "Thoughts: \n" }
      ]
    }
  },
  {
    name: "Meeting Notes",
    content: {
      ops: [
        { insert: "📋 Meeting Notes\n", attributes: { header: 1 } },
        { insert: "Date: ", attributes: { bold: true } },
        { insert: "__________\n" },
        { insert: "Attendees: ", attributes: { bold: true } },
        { insert: "__________\n" },
        { insert: "Agenda:\n" },
        { insert: "• Point 1\n• Point 2\n" },
        { insert: "Decisions Made:\n" },
        { insert: "• Decision 1\n• Decision 2\n" }
      ]
    }
  },
  {
    name: "Budget Planner",
    content: {
      ops: [
        { insert: "💰 Monthly Budget Planner\n", attributes: { header: 1 } },
        { insert: "Income:\n" },
        { insert: "__________\n" },
        { insert: "Expenses:\n" },
        { insert: "• Rent:\n• Food:\n• Utilities:\n• Other:\n" },
        { insert: "Savings Goal:\n" },
        { insert: "__________\n" }
      ]
    }
  },
  {
    name: "Shopping List",
    content: {
      ops: [
        { insert: "🛒 Shopping List\n", attributes: { header: 1 } },
        { insert: "• Item 1\n" },
        { insert: "• Item 2\n" },
        { insert: "• Item 3\n" },
        { insert: "Add your items here...\n" }
      ]
    }
  },
  {
  name: "Workout Plan",
  content: {
    ops: [
      { insert: "🏋️ Workout Plan\n", attributes: { header: 1 } },
      { insert: "Date: ", attributes: { bold: true } },
      { insert: "__________\n" },
      { insert: "Exercises:\n" },
      { insert: "• Warm-up: 10 min\n" },
      { insert: "• Strength: 3 sets x 12 reps\n" },
      { insert: "• Cardio: 30 min\n" },
      { insert: "Notes: \n" }
    ]
  }
},
{
  name: "Recipe Note",
  content: {
    ops: [
      { insert: "🍳 Recipe Note\n", attributes: { header: 1 } },
      { insert: "Dish Name: ", attributes: { bold: true } },
      { insert: "__________\n" },
      { insert: "Ingredients:\n" },
      { insert: "• Ingredient 1\n• Ingredient 2\n• Ingredient 3\n" },
      { insert: "Steps:\n" },
      { insert: "1. Step one\n2. Step two\n3. Step three\n" }
    ]
  }
},
{
  name: "Travel Itinerary",
  content: {
    ops: [
      { insert: "✈️ Travel Itinerary\n", attributes: { header: 1 } },
      { insert: "Destination: ", attributes: { bold: true } },
      { insert: "__________\n" },
      { insert: "Dates: ", attributes: { bold: true } },
      { insert: "__________\n" },
      { insert: "Plan:\n" },
      { insert: "Day 1: ________\n" },
      { insert: "Day 2: ________\n" },
      { insert: "Day 3: ________\n" }
    ]
  }
}
];

export default function Templates() {
    const [open, setOpen] = useState(true);
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        modules: { toolbar: TOOLBAR_OPTIONS }
      });
    }
  }, []);

  const handleLoadTemplate = (content) => {
    if (quillRef.current) {
      quillRef.current.setContents(content);
    }
  };

  const handleSave = () => {
    const content = quillRef.current.getContents();
    localStorage.setItem('savedTemplate', JSON.stringify(content));
    alert('✅ Document saved locally!');
  };

 const handleDownloadPDF = () => {
  const editor = document.querySelector('.ql-editor');

  // Backup original style
  const originalHeight = editor.style.height;
  const originalOverflow = editor.style.overflow;

  // Set styles for full content
  editor.style.height = 'auto';
  editor.style.overflow = 'visible';

  // Create PDF
  html2pdf()
    .from(editor)
    .set({
      margin: 1,
      filename: 'document.pdf',
      html2canvas: { scale: 2 }, // High quality
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    })
    .save()
    .then(() => {
      // Restore styles
      editor.style.height = originalHeight;
      editor.style.overflow = originalOverflow;
    });
};


  const handleDownloadDoc = () => {
    const text = quillRef.current.getText();
    const blob = new Blob([text], { type: 'application/msword' });
    const link = document.createElement('a');
    link.download = 'document.doc';
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  return (
    <div className="templates-container">
             {/* Sidebar with toggle props */}
            <Sidebar open={open} setOpen={setOpen} />
      <h1>📑 Templates Library</h1>
      <div className="templates-list">
        {templates.map((tpl, idx) => (
          <button key={idx} onClick={() => handleLoadTemplate(tpl.content)}>
            {tpl.name}
          </button>
        ))}
      </div>
      <div className="toolbar">
        <button onClick={handleSave}>💾 Save</button>
        <button onClick={handleDownloadPDF}>📄 Download PDF</button>
        <button onClick={handleDownloadDoc}>📝 Download DOC</button>
      </div>
      <div className="editor-wrapper">
        <div ref={editorRef} className="editor"></div>
      </div>
    </div>
  );
}
