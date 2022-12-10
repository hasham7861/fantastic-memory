## Steps to using projects

1. Install docker & docker daemon
2. Build image: `docker build -t fantastic-memory:server .`
3. Startup image: `docker run -p 5000:5000 -it fantastic-memory:server`


# Technical

### Development 

# Steps
1. Install docker
2. To run db locally run the following commands
   1. mkdir ~/data
   2. sudo docker run -d -p 27017:27017 -v ~/data:/data/db mongo
3. Then install client and server node modules
4. Then start dev