# Setup a new node/swarm cluster

ToDo: Add detailed setup files and instructions.

Basically following steps have to be done:
- Fire up server(s), config firewall to open ports 80, 443 and 22
- Setup a Docker Swarm on your servers
- Create some folders for setup scripts, configs (nginx) and ssl certificates 
- Run certbot container and obtain ssl certificate for domain
- Login to docker hub for private images (if necessary) and pull images
- Set max_map_count value for Elasticsearch on host (still necessary for v7+)
- Deploy Swarm stack 
- Initialize Elasticsearch (templates and indices)
- Import default masterdata (e.g. Units)
- Register cron job for renewing ssl certificate