particlesJS('background', {
  "particles": {
    "number": {
      "value": 128,
    },
    "color": {
      "value": "#f59403"
    },
    "shape": {
      "type": "circle",
      "stroke": {
        "width": 1,
        "color": "#f59403"
      },
    },
    "opacity": {
      "value": 0.3,
      "random": true,
      "anim": {
        "enable": false,
        "speed": 1,
        "opacity_min": 0.1,
      }
    },
    "size": {
      "value": 2,
      "random": true,
    },
    "line_linked": {
      "enable": true,
      "distance": 256,
      "color": "#f59403",
      "opacity": 0.15,
      "width": 1
    },
    "move": {
      "enable": true,
      "speed": 3,
      "random": true,
      "out_mode": "bounce",
      "attract": {
        "enable": true,
        "rotateX": 10000,
        "rotateY": 10000
      }
    }
  },
  "interactivity": {
    "detect_on": "window",
    "events": {
      "onhover": {
        "enable": true,
        "mode": "bubble"
      },
      "onclick": {
        "enable": false,
      },      
    },
    "modes": {
      "bubble": {
        "distance": 256,
        "size": 5,
        "opacity": 0.9,
        "speed": 1
      },
    },
  },
  "retina_detect": true
});