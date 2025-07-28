export default `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi:ital@0;1&display=swap"
      rel="stylesheet"
    />
    <title>Animated Slide Presentation</title>
    <style>
      * {
        box-sizing: border-box;
      }
      body,
      html {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;
        font-family: Arial, sans-serif;
      }

      body {
        padding: 0 20px;
      }

      .slide-container {
        width: 100%;
        height: 100%;
        background-color: transparent;
        position: relative;
        overflow: hidden;
      }

      .slide {
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        box-sizing: border-box;
      }

      .bullet {
        font-size: calc(1vw + 1vh + 1vmin);
        color: black;
        margin: clamp(0.25rem, 1vh, 0.5rem) 0;
        opacity: 0;
        font-family: "Tiro Devanagari Hindi", serif;
        transform: translateX(-30px);
        display: flex;
        align-items: center;
      }

      .bullet.animate {
        animation: revealText 0.8s ease-out forwards;
      }

      @keyframes revealText {
        0% {
          opacity: 0;
          transform: translateX(-30px);
        }
        100% {
          opacity: 1;
          transform: translateX(0);
        }
      }
    </style>
  </head>
  <body>
    <div class="slide-container">
      <div class="slide">{bullet_points_html}</div>
    </div>

    <script>
      let bullets = [];
      let animationState = { 
        playing: true, 
        startTime: null, 
        elapsedTime: 0,
        currentIndex: 0,
        animationTimeout: null
      };

      function resetAnimation() {
        // Clear any existing animations
        if (animationState.animationTimeout) {
          clearTimeout(animationState.animationTimeout);
        }
        
        // Reset all bullets
        bullets.forEach(bullet => {
          bullet.classList.remove("animate");
          bullet.style.opacity = "0";
          bullet.style.transform = "translateX(-30px)";
        });
        
        animationState.currentIndex = 0;
      }

      function startAnimation() {
        bullets = document.querySelectorAll(".bullet");
        resetAnimation();
        animationState.startTime = performance.now();
        animateBullets(0);
      }

      function animateBullets(index) {
        if (index >= bullets.length) return;
        if (!animationState.playing) return;

        animationState.currentIndex = index;
        animationState.animationTimeout = setTimeout(() => {
          bullets[index].classList.add("animate");
          animateBullets(index + 1);
        }, 500);
      }

      function seekToTime(timeInSeconds) {
        // Calculate which bullets should be visible based on time
        const bulletDuration = 0.5; // Duration for each bullet animation
        
        // Reset animation state
        resetAnimation();
        
        // Calculate which bullets should be visible
        const visibleBullets = Math.floor(timeInSeconds / bulletDuration);
        
        // Show bullets up to the current time without animation
        if (animationState.playing) {
          for (let i = 0; i < visibleBullets && i < bullets.length; i++) {
            // Skip animation and make bullet visible instantly
            bullets[i].style.opacity = "1";
            bullets[i].style.transform = "translateX(0)";
          }
          
          // Update animation state
          animationState.currentIndex = visibleBullets;
          animationState.elapsedTime = timeInSeconds * 1000;
          
          // Continue animation from current point if playing
          if (visibleBullets < bullets.length) {
            animateBullets(visibleBullets);
          }
        }
      }

      window.addEventListener("message", (event) => {
        if (!bullets.length) bullets = document.querySelectorAll(".bullet");

        const currentTime = event.data.currentTime;
        const wasPlaying = animationState.playing;
        animationState.playing = event.data.playing;
        
        if (animationState.playing) {
          // When starting to play, calculate startTime and continue animation
          animationState.startTime = performance.now() - animationState.elapsedTime;
          seekToTime(currentTime);
        } else {
          // When paused, just stop new animations without hiding existing bullets
          animationState.elapsedTime = performance.now() - animationState.startTime;
          if (animationState.animationTimeout) {
            clearTimeout(animationState.animationTimeout);
          }
          // Remove the resetAnimation call to keep visible bullets
        }
      });
      ;
    </script>
  </body>
</html>
`
