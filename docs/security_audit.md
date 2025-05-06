# Vulnerabilities

## Prototype Pollution in Iodash
Severity: High
Location: ```lodash.pick```
Risk: Prototype pollution can lead to things like altering app logic or the ability to crash the server

## Vite server.fs.deny
Severity: Moderate
Package: vite
Path: src/frontend/shopsmart-project/package-lock.json
Details: There are multiple ways to bypass this feature that should be patched

# Resolved Vulnerabilities

## Malicious Package
Severity: Critical
Package: axois
Details: An npm package called axois was installed into the project. This package bears a similar name to the legitimate package 'axios'.
Resolution: package has been removed from the project and an advisory has been sent out to developers

## Babel inefficient RegExp complexity
Severity: Moderate
Package: @babel
Details: Code is vulnerable if...
- Babel is used to compile
- using the ```.replace``` method on a RegEx that contains named capturing groups
- Code uses untrusted strings as the second argument of ```.replace```
Resolution: Patched by Babel
