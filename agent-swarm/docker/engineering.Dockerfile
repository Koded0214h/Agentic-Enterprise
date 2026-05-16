# AOS Runtime — Engineering agent category
# Extra tools: git, Node.js, npm, python3 dev, build tools
#
# Build: docker build -f docker/engineering.Dockerfile -t aos-runtime-engineering:latest .

FROM aos-runtime:latest

USER root

RUN apt-get update && apt-get install -y --no-install-recommends \
    nodejs npm make gcc g++ \
    && rm -rf /var/lib/apt/lists/*

# Engineering agents may need to run npm/pytest in workspace
ENV ALLOWED_COMMANDS="npm,npx,node,python3,pytest,git,make,ls,find,grep,cat,mkdir"

USER swarm
