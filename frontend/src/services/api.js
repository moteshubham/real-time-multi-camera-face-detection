export async function getHealth() {
    const res = await fetch("http://localhost:5000/health");
    return res.json();
  }
  