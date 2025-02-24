# OSINT Technologies

## Shodan
Shodan is a search engine that can find and list devices that are connected to the internet. This allows for the user of the engine to search for vulnerabilities in a system

### Integration
Will be used to detect open ports and send alerts to IT staff of potential vulnerabilities

## Have I Been Pwned
haveibeenpwned.com allows you to search credentials to see if they have been compromised in any data breaches. Loading the information into the site checks a database of leaked credentials and gives a description of whether they are involved in any breaches and which service was the source of the breach

### Integration
Will be used to report whether employee credentials are exposed on the internet and we can use the information to prompt employees to change their login information.

## VirusTotal
VirusTotal is a service that can analyze files and detect malware

## Integration
Will be used to scan files and urls that enter our systems and check for any malware signatures.
Upon detecting any malware, a flag will be raised on the file that can prompt us to block the file from entering.
