# Real-time Threat Intelligence

[Jump to Project Overview](#project-overview)

##	Week-by-Week Updates

Week 10 — *Deadline: 27 April 2025* 

| Task                          | Submission Path                      |
|-------------------------------|---------------------------------------|
| Final Project Report(Hallee)          | `NEED/docs/final_project_report.pdf`     |
| Final Presentation Slides(Morgan)     | `NEED/docs/final_presentation.pptx`      |
| Final System Demonstration *(optional)*(Together) | `NEED/docs/final_demo.mp4`           |
| System Walkthrough Guide(Zach)      | `NEED/docs/system_walkthrough.md`        |
| Final Git Repository Update   | `/README.md`                         |

---

Week 9 — *Deadline: 20 April 2025*

| Task                                 | Submission Path                                                        |
|--------------------------------------|-------------------------------------------------------------------------|
| Security Validation Report(Maisha)           | `NEED/docs/security_validation.md`                                         |
| Performance Test Results(Zach)             | `NEED/docs/performance_testing.md`                                         |
| Optimized Database Queries(Hallee)           | `db/query_optimizations.sql`                                          |
| Deployment Checklist & Production Setup(Morgan) | `NEED/docs/deployment_checklist.md`                                    |
| Peer Review Report & Issue Tracking(Morgan)  | `NEED/docs/peer_review.md`, `NEED/docs/issue_tracking.md`                     |
| Troubleshooting & Maintenance Guide  | `/docs/troubleshooting_guide.md`                                       |

---

Week 8 — *Deadline: 13 April 2025*

| Task                                | Submission Path                          |
|-------------------------------------|-------------------------------------------|
| Automated Defensive Response Script(Zach) | `/src/backend/blue_team_defense.js`              |
| AI-Powered Threat Hunting(Luis)   | `/src/ai_threat_hunting.js`              |
| Automated Threat Mitigation System(Maisha) | `NEED/src/threat_mitigation.py`              |
| Complete System Documentation(Hallee)       | `NEED/docs/system_manual.md`                 |
| User Guide for Analysts(Hallee)             | `NEED/docs/user_guide.md`                    |
| API Documentation(Luis)                   | `NEED/docs/api_documentation.yaml`           |

---


Week 7 — *Deadline: 6 April 2025*

| Task                             | Submission Path                          |
|----------------------------------|-------------------------------------------|
| Updated Risk Scoring Model       | `src/backend/risk_scoring.js`                    |
| Threat Report Generator          | `src/backend/report_generator.js`                |
| Security Audit Report(Zach)            | `NEED/docs/security_audit.md`                |
| Threat Event Logging System(Hallee)      | `/src/backend/logging.js`                         |
| Optimized Database Queries(Hallee)       | `db/query_optimizations.sql`              |

--- 

Week 6 — *Deadline: 30 March 2025*

| Task                              | Submission Path                      |
|-----------------------------------|--------------------------------------|
| Real-Time Alert System            | `src/backend/alerts.js`                     |
| Incident Response Mechanism       | `src/backend/incident_response.js`          |
| CBA Automation Script             | `src/backend/cba_analysis.js`               |
| Enhanced Threat Intelligence Dashboard | `src/frontend/shopsmart-project/src/components/ThreatDashboard.vue`    |
| API Optimization & Caching        | `src/backend/api_optimizer.js`             |

---

Week 5 — *Deadline: 23 March 2025*

| Task                                 | Submission Path                             |
|--------------------------------------|---------------------------------------------|
| LLM-Based Risk Scoring               | `src/backend/risk_analysis.js`                     |
| Updated TVA Mapping Script           | `db/tva_update.sql`                        |
| Risk Prioritization Model            | `src/frontend/shopsmart-project/src/utils/risk_prioritization.js`               |
| Automated Risk Mitigation Module     | `src/backend/mitigation_recommendations.js`        |
| Blue Teaming Response Module         | `src/backend/incident_response.js`                 |

---

Week 4 — *Deadline: 16 March 2025*

| Task                             | Submission Path                             |
|----------------------------------|---------------------------------------------|
| Backend API Integration          | `api/shodan_integration.js`               |
| Threat Data Storage & Automation | `src/backend/utils.js`                         |
| Real-Time Dashboard UI           | `src/frontend/shopsmart-project/src/components/ThreatDashboard.vue`        |
| High-Risk Alert System           | `src/backend/alerts.js`                            |
| API Testing & Validation         | `src/backend/tests/api_tests.test.js`                       |

---

Week 3 — *Deadline: 9 March 2025*

| Task                                   | Submission Path                             |
|----------------------------------------|---------------------------------------------|
| Asset Inventory in Database            | `db/assets.sql`                            |
| TVA Mapping Schema & Sample Data       | `db/tva_mapping.sql`                       |
| Automated Threat Data Collection       | `api/fetch_osint.js`                       |
| Risk Assessment Logic                  | `/src/backend/utils.js`                     |
| Dashboard Display for TVA Mapping      | `src/frontend/shopsmart-project/src/components/ThreatDashboard.vue`        |

---

Week 2 — *Deadline: 2 March 2025*

| Task                             | Submission Path                             |
|----------------------------------|---------------------------------------------|
| Basic Web App Structure          | `src`                                     |
| Database Schema                  | `db/schema.sql`       |
| API Research Report              | `docs/api_research.md`                     |
| OSINT API Integration Scripts    | `api`                                     |
| Initial Dashboard UI             | `src/frontend/shopsmart-project/src/components`                          |


## Project Overview

The **Real-time Threat Intelligence (RTTI)** system is designed to track and identify cybersecurity threats in real time. By leveraging a combination of machine learning algorithms, Open-Source Intelligence (OSINT) technologies, and external APIs, the system detects potential risks and provides actionable insights. This allows for proactive threat mitigation through dynamic analysis of large-scale data.

---

## Key Features

- Real-time threat monitoring and detection  
- Integration with external OSINT APIs: Shodan, Have I Been Pwned, VirusTotal  
- Dynamic risk scoring powered by a Large Language Model (LLM)  
- Interactive user interface for displaying real-time intelligence  
- Data-driven risk assessment and mitigation recommendations  

---

## Technologies Used

- **Back-End:** Node.js  
- **Front-End:** Vue.js  
- **Database:** PostgreSQL  
- **OSINT Tools:** Shodan, Have I Been Pwned, VirusTotal  
- **Machine Learning:** LLM for automated risk scoring  

---

## Team Members and Responsibilities

- **Morgan Sansone** – *Project Manager*  
  Oversees workflow, ensures deadlines are met, and coordinates the team.  

- **Zach Green** – *OSINT Specialist*  
  Integrates and manages external OSINT tools and APIs.  

- **Luis Sanchez** – *Risk Analyst*  
  Performs threat assessments, risk mapping, and develops mitigation strategies.  

- **Maisha Islam** – *Developer*  
  Develops and integrates back-end and front-end components.  

- **Hallee Pham** – *Documentation Lead*  
  Maintains project documentation and version control.  

---

## Installation

### Prerequisites

- Node.js  
- Vue.js  
- PostgreSQL  (Supabase)
- Access to OSINT API keys (Shodan, Have I Been Pwned, VirusTotal)  

---

### Steps to Run the Project

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/real-time-threat-intelligence.git
   cd real-time-threat-intelligence
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up the PostgreSQL database**  
   - Create the database.  
   - Configure the database connection in your environment file.

4. **Add API Keys**  
   - Add your Shodan, HIBP, and VirusTotal API keys to your environment configuration.

5. **Start the application**

   ```bash
   npm run serve
   ```
## Set Up the Local AI Threat Prediction Service

This powers `/src/ai_threat_hunting.js` with local threat prediction using a Hugging Face model. We are using this to circumvent having to pay for an api key.

#### Windows Setup

1. **Install Python**
   ```bash
    pip install transformers torch fastapi uvicorn
   ```

3. **Create the AI service script**

   ```bash
   notepad ai_threat_service.py
   ```

   Paste the following code and save the file:

   ```python
   from fastapi import FastAPI, Request
   from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
   import uvicorn

   app = FastAPI()

   model_name = "google/flan-t5-base"
   tokenizer = AutoTokenizer.from_pretrained(model_name)
   model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
   generator = pipeline("text2text-generation", model=model, tokenizer=tokenizer)

   @app.post("/predict")
   async def predict_threat(req: Request):
       body = await req.json()
       prompt = body.get("prompt", "")
       result = generator(prompt, max_length=100, do_sample=True)[0]["generated_text"]
       return {"output": result}

   if __name__ == "__main__":
       uvicorn.run(app, host="0.0.0.0", port=8000)
   ```

4. **Run the server**

   ```bash
   python ai_threat_service.py
   ```

   You should see:  
   `Uvicorn running on http://0.0.0.0:8000`

5. **Test the API**

   ```bash
   curl -X POST http://localhost:8000/predict ^
     -H "Content-Type: application/json" ^
     -d "{\"prompt\": \"SQL Injection detected on login page.\"}"
   ```

---

#### 🍎 macOS Setup

1. **Install Python**

   ```bash
   brew install python
   ```

2. **Install required Python packages**

   ```bash
   pip3 install transformers torch fastapi uvicorn
   ```

3. **Create the AI service script**

   ```bash
   nano ai_threat_service.py
   ```

   Paste the following code and save using `Ctrl + O`, `Enter`, then `Ctrl + X`:

   ```python
   from fastapi import FastAPI, Request
   from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
   import uvicorn

   app = FastAPI()

   model_name = "google/flan-t5-base"
   tokenizer = AutoTokenizer.from_pretrained(model_name)
   model = AutoModelForSeq2SeqLM.from_pretrained(model_name)
   generator = pipeline("text2text-generation", model=model, tokenizer=tokenizer)

   @app.post("/predict")
   async def predict_threat(req: Request):
       body = await req.json()
       prompt = body.get("prompt", "")
       result = generator(prompt, max_length=100, do_sample=True)[0]["generated_text"]
       return {"output": result}

   if __name__ == "__main__":
       uvicorn.run(app, host="0.0.0.0", port=8000)
   ```

4. **Run the server**

   ```bash
   python3 ai_threat_service.py
   ```

   You should see:  
   `Uvicorn running on http://0.0.0.0:8000`

5. **Test the API**

   ```bash
   curl -X POST http://localhost:8000/predict \
     -H "Content-Type: application/json" \
     -d '{"prompt": "SQL Injection detected on login page."}'
   ```
