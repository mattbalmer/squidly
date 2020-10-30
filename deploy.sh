target_host="YOUR_IP_OR_DOMAIN_NAME"
target_path="~/applications/squidly"
rsync -av -e ssh --include-from=deploylist.txt ./ root@${target_host}:${target_path}