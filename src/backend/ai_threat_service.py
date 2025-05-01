from fastapi import FastAPI, Request
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM
import uvicorn

app = FastAPI()

# Use public, CPU-friendly instruction-tuned model
model_name = "google/flan-t5-base"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

# Use pipeline for generation
generator = pipeline("text2text-generation", model=model, tokenizer=tokenizer)

@app.post("/predict")
async def predict_threat(req: Request):
    body = await req.json()
    prompt = body.get("prompt", "")

    result = generator(prompt, max_length=100, do_sample=True)[0]["generated_text"]
    return {"output": result}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
