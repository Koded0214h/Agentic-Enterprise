# AOS Runtime — Default agent category (sales, marketing, support, strategy, etc.)
# Minimal tools: no git, no Node.js — text/API only agents
#
# Build: docker build -f docker/default.Dockerfile -t aos-runtime-default:latest .

FROM aos-runtime:latest

USER root

# No additional system packages — these agents only need Python + LLM APIs
ENV ALLOWED_COMMANDS="ls,find,grep,cat,echo,python3"

USER swarm
