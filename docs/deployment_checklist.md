# Deployment Checklist – Real-Time Threat Intelligence (RTTI)

## ✅ Server Security

- [x] OS and packages updated (`sudo apt update && sudo apt upgrade -y`)
- [x] Created new non-root user (`deployuser`)
- [x] SSH key-based login configured
- [x] Root login disabled in `sshd_config`
- [x] Password authentication disabled in `sshd_config`
- [x] UFW firewall enabled and ports allowed (OpenSSH, 80, 443)
- [x] Fail2Ban installed and enabled

## ✅ Logging & Monitoring

- [x] `rsyslog` and `logrotate` confirmed active
- [x] Fail2Ban logging working
- [ ] CloudWatch Agent or alternative monitoring set up

## ✅ Deployment (AWS EC2 Example)

- [x] Code uploaded via `scp` to `/var/www/html/`
- [x] Web server restarted (`apache2` or `nginx`)
- [x] App accessible via public IP/domain
- [x] HTTPS configured (e.g., Let’s Encrypt)

## ✅ Application Testing

- [x] Services checked (`systemctl status`)
- [x] App endpoints tested (`/health`, `/api`)
- [x] Frontend loads correctly
- [x] Database connected and functional

## ✅ Final Git Commit

- [x] Deployment scripts/configs added to repo
- [x] Final commit made with message:
```

git add deploy/ configs/ docs/deployment\_checklist.md
git commit -m "Finalize production deployment configs and checklist"
git push origin main

```
