"""Secret-safe EverOS live-path verifier.

Runs one verified agent-memory write, flushes extraction, and retrieves the
result. It prints only statuses and provider IDs, never the API key or memory
content.
"""

from __future__ import annotations

import os
import time

from everos_cloud import EverOS


USER_ID = "touchdown-demo-learner"
SESSION_ID = f"token-optimization-{int(time.time())}"


def main() -> None:
    if not os.environ.get("EVEROS_API_KEY"):
        raise SystemExit("EVEROS_API_KEY is not loaded in this shell")

    client = EverOS()
    agent = client.v1.memories.agent
    memories = client.v1.memories
    now = int(time.time() * 1000)

    added = agent.add(
        user_id=USER_ID,
        session_id=SESSION_ID,
        messages=[
            {
                "role": "user",
                "timestamp": now,
                "content": "Reduce repeated uncached coding-agent context while preserving the acceptance test.",
            },
            {
                "role": "assistant",
                "timestamp": now + 1,
                "content": "Kept stable instructions first, projected test logs to failing evidence, reran the frozen test, and retained only the verified procedure.",
            },
        ],
    )
    flushed = agent.flush(user_id=USER_ID, session_id=SESSION_ID)
    found = memories.search(
        filters={"user_id": USER_ID},
        query="How should I reduce repeated coding-agent context without weakening verification?",
        method="hybrid",
        memory_types=["agent_memory"],
        top_k=5,
    )

    task_id = getattr(getattr(added, "data", None), "task_id", None)
    flush_status = getattr(getattr(flushed, "data", None), "status", "unknown")
    data = getattr(found, "data", None)
    case_count = len(getattr(data, "agent_cases", None) or [])
    skill_count = len(getattr(data, "agent_skills", None) or [])
    print(f"add_status=accepted task_id_present={bool(task_id)}")
    print(f"flush_status={flush_status}")
    print(f"retrieval_status=success cases={case_count} skills={skill_count}")
    print("secret_printed=false raw_memory_printed=false")


if __name__ == "__main__":
    main()
