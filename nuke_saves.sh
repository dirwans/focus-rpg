cd ~/focus-rpg/data
for f in save_*.json; do
  if [ "$f" != "save_bellaku.json" ]; then
    rm "$f"
    echo "DELETED: $f"
  fi
done
echo "--- Remaining: ---"
ls save_*.json
