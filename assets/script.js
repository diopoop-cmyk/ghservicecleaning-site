
(function(){
  const WA_NUMBER = "13475399538"; // US number with country code (no +)
  const waBtn = document.getElementById("waFloat");
  if(waBtn){
    const msg = encodeURIComponent("Hi! I’m interested in a quote for cleaning. Can you help?");
    waBtn.href = `https://wa.me/${WA_NUMBER}?text=${msg}`;
  }

  // Prevent "empty" submissions (only spaces) on Netlify form
  const form = document.querySelector('form[name="quote"]');
  if(form){
    form.addEventListener("submit", function(e){
      const requiredFields = form.querySelectorAll("[required]");
      for(const el of requiredFields){
        const v = (el.value || "").trim();
        if(!v){
          e.preventDefault();
          el.focus();
          alert("Please fill out all required fields.");
          return false;
        }
      }
      return true;
    });
  }
})();
