# Installation

This document guides you through installing and configuring the pdf-re-processor on a Linux server.

## Prerequisites:
Linux server with SSH access
Node.js (version 20.5.1 or later) and npm installed (refer to https://nodejs.org/en/download for installation instructions)
`unzip` command installed on the server (check with unzip -v)

### Logrotate
For log rotation, we need to have logrotate installed and configured on the Linux server following the steps below

On Ubuntu, install the package using apt-get:
`sudo apt-get update`
`sudo apt-get install -y logrotate`
For RHEL based Linux such as CentOS, use the yum package manager
`sudo yum update`
`sudo yum install -y logrotate`

#### Configuring logrotate

We can configure logrotate script and configure it to run every day, every week, every month, and so on.

Create a configuration files in the directory `/etc/logrotate.d/` for each service/application.

`/path/to/project/PDF-Pre-Processor/logs/*log {
daily
rotate 10
size 20M
copytruncate
missingok
notifempty
olddir `/directory/to/hold/old/log/files`
compress
delaycompress
dateext
sharedscripts
}`

The above sample configuration rotates the log files in the specified log directory daily.



## Configuration
The application should have a configuration file in it's root, .env, that defines environment variables for the /ftp endpoint and other functionalities. Edit this file according to your setup, providing the following details:

HOST=
PORT=
FTP_PORT=
FTP_HOST=
FTP_USER=
FTP_PASSWORD=
REMOTE_DIRECTORY=
REMOTE_OUTPUT=
SUCCESS_DIR=
ERROR_DIR=

The `SUCCESS_DIR` and `ERROR_DIR` variables represent directories that the processed and failed files should me copied to

## Steps:
1. Transfer the ArchiveL Upload the zipped application archive (PDF-Re-Processor.zip) to the desired location on the server using tools like scp or SFTP clients.

2. Unzip the archive:
   `unzip PDF-Re-Processor.zip`

3. Navigate to the application directory.
   `cd PDF-Re-Processor`

4. Install project dependencies using npm:
   `npm install`


## Starting the Application

### Development
1. Navigate to your application directory:
   `cd <app-directory>`
2. `npm start`
3. Trigger Scan: `./run_ftp_endpoint.sh`


### Production
Note: The scan will NOT begin immediately when running manually. You need to run a separate script to trigger the scan.
1. sudo npm install pm2 -g
2. Navigate to your application directory:
      `cd <app-directory>`
3. `npm start`
4. Trigger Scan: `./run_ftp_endpoint.sh`


## Setting Up a CRON Job (optional)

Create a CRON Script:

There is a shell script (e.g., run_ftp_endpoint.sh) in the application directory with the following content:

## Navigate to your application directory (adjust if needed)
`cd /path/to/PDF-Re-Processor`

## Run your Node.js application
`npm start`

## Make the script executable:
`chmod +x run_ftp_endpoint.sh`


## Schedule the CRON Job:

Edit the system's crontab using crontab -e.
Add a new line specifying the schedule and script to run. Here's an example to run the script every minute:

`* * * * * /path_to/PDF-Re-Processor/run_ftp_endpoint.sh`
Adjust the schedule (* * * * *) according to your desired frequency (e.g., 0 0 * * * for daily at midnight).
Save and exit the crontab editor.

## Additional Notes

### Logs
Application logs can be found in the logs folder within the application code directory.

### environment variables
The HOST and PORT mentioned in the configuration refer to the server's host address and port where the application is running.

### file upload location
When a scan is complete, the modified pdf files are saved in a `/output` directory from the root specified in the .env

### reset scan log
If for some reason, we intend to re-run the scanner from scratch (include previously scanned files), you can utilize the
script `reset_last_scan.sh`

### starting and stopping application
There are additional commands to control application status besides  `npm start`
`npm stop` To kill the application
`npm status` To check the status (whether running or stopped) of the application