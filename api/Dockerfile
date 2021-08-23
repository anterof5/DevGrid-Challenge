# set base image (host OS)
FROM python:3.8

# set the working directory in the container
WORKDIR /api

# copy the all files to the working directory
COPY . .


# install dependencies
RUN pip install -r requirements.txt

# commands to run on container start
CMD [ "python", "run.py" ]
