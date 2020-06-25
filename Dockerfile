FROM mantenpanther/enyine-app-base:latest
# RUN cd /src; npm update (only if node_modules are not in .dockerignore)
COPY . /src