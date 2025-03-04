# API Research

## API

### What is an API?
First off, we need to know what an API is. I will start by using a scenario.  

In a restaurant, the customer orders food from the kitchen. For the kitchen to get the order and send out the food, they need a waiter. In this scenario:
- **The customer** → The user of our website.  
- **The kitchen** → The OSINT programs we will use.  
- **The waiter** → The API, which connects them.  

APIs are **connections between services or programs**. We will use these APIs to **strengthen our website's security** and protect it from hackers and malicious intent.

---

## **Shodan**
### What is it?  
- Shodan is a **search engine for internet-connected devices** rather than websites.  
- It can be used to find devices such as **servers, databases, mobile devices, routers**, etc.  

### What is it used for?  
- It helps check if anything in our **network is vulnerable** to hackers.  
- It casts a **wide net to detect unresolved weaknesses** in our website/business.  

### How will we use it?  
- We will use it to **scan for vulnerabilities** in our website, like a diagnosis tool.  
- We will also use it to **scan for unauthorized devices**.  

---

## **Have I Been Pwned (HIBP)**
### What is it?  
- HIBP is a service that **checks if an email or password has been exposed** in known data breaches.  
- It helps businesses and individuals **detect compromised credentials** to prevent unauthorized access.  

### What is it used for?  
- It **alerts users** if their email or password has been leaked.  
- Helps **improve account security** by encouraging users to change compromised credentials.  
- **Prevents hackers** from using stolen credentials to access accounts.  

### How will we use it?  
- We will use it to **check if customers' emails have been exposed** in breaches before allowing them to register or log in.  
- We will verify if a **password has been compromised** and prompt users to choose a stronger one if necessary.  
- This helps prevent **account takeovers** and protects customer data.  

---

## **VirusTotal**
### What is it?  
- VirusTotal is an online tool that **scans files, URLs, and IP addresses** for malware using multiple antivirus engines.  
- It helps detect **malicious software, phishing sites, and security threats**.  

### What is it used for?  
- It **scans files and links** to ensure they are not infected with malware before use.  
- Identifies **malicious websites** that could harm our business or customers.  
- Helps in **detecting security risks** from third-party integrations.  

### How will we use it?  
- We will use it to **scan any suspicious files or URLs** before uploading them to our website.  
- We will check **external links and third-party services** to prevent security threats.  
- It will help ensure our **website remains secure and trusted** by customers.  

---

## **Firebase Authentication**
### What is it?  
- Firebase Authentication is a service that allows users to **sign in securely** using email/password, Google, GitHub, or other authentication providers.  
- It helps websites and apps **manage user identities** without handling passwords directly.  

### What is it used for?  
- Ensures **only authorized users** can access certain parts of the website.  
- Supports **multi-factor authentication (MFA)** and social logins for improved security.  
- Helps **prevent unauthorized access** and account takeovers.  

### How will we use it?  
- We will use it to **authenticate users** before they can access cybersecurity tools on our website.  
- It will allow **students and instructors to log in securely** using email or social accounts.  
- It ensures that **only authorized users** can interact with our security tools and scan data.  

---


**We might not use these next ones, just throwing it in here incase we need!**


---

## **Fetch API**
### What is it?  
- The Fetch API is a **built-in JavaScript feature** that allows web applications to send **HTTP requests** to external APIs.  
- It enables **communication between the frontend and backend** without needing additional libraries.  

### What is it used for?  
- Retrieves **data from external sources** like **Shodan, Have I Been Pwned, and VirusTotal**.  
- Allows **real-time fetching** of security-related data without reloading the page.  
- Helps in **sending and receiving data securely**.  

### How will we use it?  
- We will use Fetch API to **send API requests** to **Shodan, VirusTotal, and HIBP** and display results.  
- It will help us **fetch information about security threats** and display them in a user-friendly format.  
- We will use it to send and receive **JSON responses** for real-time cybersecurity analysis.  

---

## **Postman**
### What is it?  
- Postman is an **API testing tool** that allows developers to **send, receive, and debug HTTP requests** easily.  
- It helps test **API endpoints** before integrating them into a website or application.  

### What is it used for?  
- Helps check if **API requests return expected data**.  
- Allows debugging of **API authentication, headers, and response formats**.  
- Speeds up development by providing a **user-friendly interface for testing requests**.  

### How will we use it?  
- We will use Postman to **test API calls** to **Shodan, HIBP, and VirusTotal** before implementing them.  
- It will help us **verify API responses** and troubleshoot issues before deploying the website.  
- We will use it to **inspect security data** before displaying it on our platform.  
  
