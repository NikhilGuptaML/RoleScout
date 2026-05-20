from fastapi import FastAPI
import uuid
from graph.orchestration import graph
from schema import AnalyzeRequest, ResumeRequest
import uvicorn
app = FastAPI()

@app.post("/analyze")
async def analyze(request: AnalyzeRequest):
    thread_id = str(uuid.uuid4())
    thread = {"configurable": {"thread_id": thread_id}}
    
    result = graph.invoke({
        "job_desc": request.job_desc,
        "parsed_jd": None,
        "human_feedback": None,
        "final_report": None,
        "profile": request.profile
    }, thread)
    
    return {
        "thread_id": thread_id,
        "parsed_jd": result.get("parsed_jd")
    }

@app.post("/analyze/resume")
async def resume(request: ResumeRequest):
    thread = {"configurable": {"thread_id": request.thread_id}}
    
    graph.update_state(
        thread,
        {"human_feedback": request.feedback},
        as_node="Human Feedback"
    )
    
    final_result = graph.invoke(None, thread)
    return {"final_report": final_result.get("final_report")}

if __name__ =="__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)