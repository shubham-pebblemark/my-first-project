let highestZ = 1;                      // Tracks the next z-index so the active paper comes to the top.

class Paper {
  holdingPaper = false;                // Are we currently dragging (or rotating) this paper?
  mouseTouchX = 0;                     // Mouse X at the moment we first clicked (mousedown).
  mouseTouchY = 0;                     // Mouse Y at the moment we first clicked (mousedown).
  mouseX = 0;                          // Latest mouse X position (updated on mousemove).
  mouseY = 0;                          // Latest mouse Y position (updated on mousemove).
  prevMouseX = 0;                      // Previous mouse X (used to compute velocity).
  prevMouseY = 0;                      // Previous mouse Y (used to compute velocity).
  velX = 0;                            // Horizontal mouse velocity between moves (mouseX - prevMouseX).
  velY = 0;                            // Vertical mouse velocity between moves (mouseY - prevMouseY).
  rotation = Math.random() * 30 - 15;  // Start with a random tilt between -15° and +15°.
  currentPaperX = 0;                   // Accumulated translateX for this paper.
  currentPaperY = 0;                   // Accumulated translateY for this paper.
  rotating = false;                    // Are we in “rotation mode” (right mouse button held)?

  init(paper) {                        // Attach event handlers to control this specific element.
    document.addEventListener('mousemove', (e) => {        // Track mouse globally while moving.
      if(!this.rotating) {                                 // If not rotating, update pointer + velocity.
        this.mouseX = e.clientX;                           // Current mouse X in viewport coordinates.
        this.mouseY = e.clientY;                           // Current mouse Y in viewport coordinates.
        
        this.velX = this.mouseX - this.prevMouseX;         // ΔX from last event (velocity proxy).
        this.velY = this.mouseY - this.prevMouseY;         // ΔY from last event (velocity proxy).
      }
        
      const dirX = e.clientX - this.mouseTouchX;           // Vector from click point to current mouse (X).
      const dirY = e.clientY - this.mouseTouchY;           // Vector from click point to current mouse (Y).
      const dirLength = Math.sqrt(dirX*dirX+dirY*dirY);    // Length of that vector (for normalization).
      const dirNormalizedX = dirX / dirLength;             // Normalize X (unit vector). NOTE: can be NaN if length=0.
      const dirNormalizedY = dirY / dirLength;             // Normalize Y (unit vector).

      const angle = Math.atan2(dirNormalizedY, dirNormalizedX); // Angle (radians) of the direction vector.
      let degrees = 180 * angle / Math.PI;                 // Convert radians → degrees.
      degrees = (360 + Math.round(degrees)) % 360;         // Normalize to 0..359 integer degrees.
      if(this.rotating) {                                  // If in rotation mode, update rotation to this angle.
        this.rotation = degrees;
      }

      if(this.holdingPaper) {                              // If dragging (or rotating) is active:
        if(!this.rotating) {                               // When not rotating, move the paper by velocity:
          this.currentPaperX += this.velX;                 // Accumulate horizontal movement.
          this.currentPaperY += this.velY;                 // Accumulate vertical movement.
        }
        this.prevMouseX = this.mouseX;                     // Store current for next velocity calc.
        this.prevMouseY = this.mouseY;

        paper.style.transform =                            // Apply CSS transform for position + rotation:
          `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
      }
    })

    paper.addEventListener('mousedown', (e) => {           // Start drag/rotate on mouse down on this paper.
      if(this.holdingPaper) return;                        // Ignore if already holding (prevent re-entry).
      this.holdingPaper = true;                            // We’re now holding this paper.
      
      paper.style.zIndex = highestZ;                       // Bring this paper to front.
      highestZ += 1;                                       // Next top z-index for future clicks.
      
      if(e.button === 0) {                                 // Left button → drag mode.
        this.mouseTouchX = this.mouseX;                    // Save click origin (for rotation reference too).
        this.mouseTouchY = this.mouseY;
        this.prevMouseX = this.mouseX;                     // Initialize previous mouse positions for velocity.
        this.prevMouseY = this.mouseY;
      }
      if(e.button === 2) {                                 // Right button → rotation mode.
        this.rotating = true;                              // From now on, mousemove updates `rotation`.
      }
    });
    window.addEventListener('mouseup', () => {             // Release on mouse up anywhere.
      this.holdingPaper = false;                           // Stop dragging/rotating.
      this.rotating = false;                               // Exit rotation mode.
    });
  }
}

const papers = Array.from(document.querySelectorAll('.paper')); // Find all elements with class="paper".

papers.forEach(paper => {                                   // For each paper element:
  const p = new Paper();                                    // Make a controller instance.
  p.init(paper);                                            // Wire up event listeners to that element.
});
