const roasts = [
    "Wow, another tab? That'll definitely get things done.",
    "Productivity called. You sent it to voicemail.",
    "Your to-do list is crying in a corner.",
    "You're just one more meme away from greatness.",
    "Is this a work session or a Netflix binge prep?",
    "Reminder: Procrastination isn’t a career path."
  ];
  
  function getRandomRoast() {
    const index = Math.floor(Math.random() * roasts.length);
    return roasts[index];
  }
  
  document.getElementById("roast").textContent = getRandomRoast();
  
  document.getElementById("newRoast").addEventListener("click", () => {
    document.getElementById("roast").textContent = getRandomRoast();
  });

  