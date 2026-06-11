## OpsMind Project Overview

**OpsMind** is a full-stack, microservices-based AI platform designed to operate as an intelligent operational copilot for engineering and DevOps teams. Moving beyond a standard chatbot interface, it implements structured task decomposition and deterministic multi-agent execution to automate complex technical workflows.

### Key Capabilities

* **Hierarchical Multi-Agent Orchestration:** Uses a centralized Supervisor Agent to safely decompose queries and delegate subtasks to specialized agents (Research, Planning, Incident) without cyclic communication issues.


* **Continuous Knowledge Sync:** Features an automated, diff-based RAG (Retrieval-Augmented Generation) pipeline that updates code embeddings in real time via GitHub webhooks and document ingestion.


* **Real-Time Visibility:** Streams reasoning paths, execution updates, and agent state transitions instantly to the client via WebSockets.


* **Production-Grade Architecture:** Decoupled into 8 distinct microservices (Gateway, Auth, Project, Knowledge, Agent, WebSocket, Worker, Log) to guarantee data isolation, multi-tenancy, and independent horizontal scaling.
