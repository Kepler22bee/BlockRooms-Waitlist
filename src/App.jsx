import React, { useRef, useEffect, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls, KeyboardControls } from "@react-three/drei";
import { Vector3, Raycaster } from "three";
import * as THREE from "three";
import { Model } from "./Model";
import { Model as GunModel } from "./Gun1"; // Import the gun model

// Warning Dialog Component
function WarningDialog({ onAccept }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 20000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "400px",
          height: "200px",
          backgroundColor: "#c0c0c0",
          border: "2px outset #c0c0c0",
          fontFamily: "MS Sans Serif, sans-serif",
          fontSize: "11px",
        }}
      >
        {/* Title Bar */}
        <div
          style={{
            height: "20px",
            background: "linear-gradient(90deg, #0000ff 0%, #008080 100%)",
            color: "white",
            display: "flex",
            alignItems: "center",
            padding: "2px 8px",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          <span>BlockRooms</span>
        </div>

        {/* Content Area */}
        <div
          style={{
            padding: "20px",
            height: "200px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "15px",
              marginBottom: "50px",
              lineHeight: "1.4",
            }}
          >
            This is just a waitlist site and not the actual gameplay.
          </div>

          {/* Centered OK Button */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button
              onClick={onAccept}
              style={{
                width: "100px",
                height: "30px",
                backgroundColor: "#c0c0c0",
                border: "3px outset #c0c0c0",
                fontSize: "15px",

                cursor: "pointer",
                fontFamily: "MS Sans Serif, sans-serif",
              }}
              onMouseDown={e => {
                e.target.style.border = "3px inset #c0c0c0";
              }}
              onMouseUp={e => {
                e.target.style.border = "3px outset #c0c0c0";
              }}
              onMouseLeave={e => {
                e.target.style.border = "3px outset #c0c0c0";
              }}
            >
              Ok
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
function Join() {
  const [username, setUsername] = useState("");
  const [showLinks, setShowLinks] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(""); // For showing success/error messages
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current && !inputDisabled) {
      inputRef.current.focus();
    }
  }, [inputDisabled]);

  // Function to send data to SheetDB
  const submitToSheetDB = async username => {
    try {
      const currentTime = new Date();
      const formattedTime = currentTime.toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });

      // Generate serial number (timestamp-based to ensure uniqueness)
      const serialNumber = Date.now();

      const dataToSend = {
        data: [
          {
            "sl.no": serialNumber,
            "username": String(username),
            "time": formattedTime,
          },
        ],
      };

      console.log("Sending this data to SheetDB:", dataToSend);

      const response = await fetch("https://sheetdb.io/api/v1/e3qzzdsccl9j2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Data saved successfully to SheetDB:", result);
        setSubmitStatus("✅ Successfully added to waitlist!");
        return true;
      } else {
        const errorData = await response.text();
        console.error("Error saving data. Status:", response.status, "Response:", errorData);
        setSubmitStatus("❌ Error adding to waitlist. Please try again.");
        return false;
      }
    } catch (error) {
      console.error("Error during fetch:", error);
      setSubmitStatus("❌ Network error. Please check your connection.");
      return false;
    }
  };

  const handleKeyPress = async e => {
    if (e.key === "Enter" && username.trim() && !isSubmitting) {
      setIsSubmitting(true);
      setInputDisabled(true);
      setShowCursor(false);
      setSubmitStatus("⏳ Adding to waitlist...");

      // Submit to SheetDB
      const success = await submitToSheetDB(username.trim());

      if (success) {
        // Show links after successful submission
        setTimeout(() => {
          setShowLinks(true);
        }, 1000);
      } else {
        // Re-enable input on error
        setInputDisabled(false);
        setShowCursor(true);
      }

      setIsSubmitting(false);
    }
  };

  const handleFocus = () => {
    setShowCursor(false);
  };

  const handleBlur = () => {
    if (!inputDisabled) {
      setShowCursor(true);
    }
  };

  const handleClick = () => {
    if (!inputDisabled && inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div
      className='terminal'
      onClick={handleClick}
      style={{
        width: "100%",
        height: "100vh",
        padding: "20px",
        backgroundColor: "#000",
        color: "#00ff00",
        fontFamily: "'Jersey 15', monospace",
        fontSize: "30px",
        lineHeight: "1.4",
        overflow: "hidden",
      }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Jersey+15&display=swap');

          body {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          .terminal {
            overflow-y: auto;
          }

          .cursor {
            display: inline-block;
            width: 8px;
            height: 16px;
            background-color: #00ff00;
            animation: blink 1s infinite;
          }

          @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
          }

          .terminal-input {
            background: transparent;
            border: none;
            color: #00ff00;
            font-family: 'Jersey 15', monospace;
            font-size: 30px;
            outline: none;
            flex: 1;
          }

          .links a {
            color: #00ff00;
            text-decoration: underline;
          }

          .links a:hover {
            color: #00ffff;
          }

          .status-message {
            font-size: 20px;
            margin-top: 10px;
            opacity: 0.8;
          }

          .success-message {
            color: #00ff00;
          }

          .error-message {
            color: #ff6b6b;
          }

          .loading-message {
            color: #ffff00;
          }
        `}
      </style>

      <div style={{ marginBottom: "20px", whiteSpace: "pre" }}>
        {`██████╗░██╗░░░░░░█████╗░░█████╗░██╗░░██╗██████╗░░█████╗░░█████╗░███╗░░░███╗░██████╗
██╔══██╗██║░░░░░██╔══██╗██╔══██╗██║░██╔╝██╔══██╗██╔══██╗██╔══██╗████╗░████║██╔════╝
██████╦╝██║░░░░░██║░░██║██║░░╚═╝█████═╝░██████╔╝██║░░██║██║░░██║██╔████╔██║╚█████╗░
██╔══██╗██║░░░░░██║░░██║██║░░██╗██╔═██╗░██╔══██╗██║░░██║██║░░██║██║╚██╔╝██║░╚═══██╗
██████╦╝███████╗╚█████╔╝╚█████╔╝██║░╚██╗██║░░██║╚█████╔╝╚█████╔╝██║░╚═╝░██║██████╔╝
╚═════╝░╚══════╝░╚════╝░░╚════╝░╚═╝░░╚═╝╚═╝░░╚═╝░╚════╝░░╚════╝░╚═╝░░░░░╚═╝╚═════╝░`}
      </div>

      <div style={{ marginTop: "30px" }}>
        <div>Enter your Discord Username to join the waitlist</div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ marginRight: "5px" }}>{">"}</span>
          <input
            ref={inputRef}
            type='text'
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={inputDisabled}
            className='terminal-input'
            autoComplete='off'
            placeholder={inputDisabled ? "" : "your_discord_username"}
          />
          {showCursor && <span className='cursor'></span>}
        </div>

        {/* Status Message */}
        {submitStatus && (
          <div
            className={`status-message ${
              submitStatus.includes("✅") ? "success-message" : submitStatus.includes("❌") ? "error-message" : "loading-message"
            }`}
          >
            {submitStatus}
          </div>
        )}

        {showLinks && (
          <div className='links' style={{ marginTop: "20px" }}>
            <div style={{ marginBottom: "10px", fontSize: "24px" }}>Welcome to the waitlist! Join our community:</div>
            <div>
              Twitter:{" "}
              <a href='https://x.com/_BlockRooms' target='_blank' rel='noopener noreferrer'>
                https://x.com/_BlockRooms
              </a>
            </div>
            <div>
              Discord:{" "}
              <a href='https://discord.gg/WftQ9n5w' target='_blank' rel='noopener noreferrer'>
                https://discord.gg/WftQ9n5w
              </a>
            </div>
            <div style={{ marginTop: "15px", fontSize: "18px", opacity: "0.7" }}>
              You'll receive updates via Discord. Keep an eye on your DMs!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Gun component that follows the camera
function Gun({ isVisible = true, onShoot }) {
  const gunRef = useRef();
  const { camera, scene } = useThree();

  // Timer to drive breathing motion
  const swayTime = useRef(0);

  // Shooting and recoil state
  const [isRecoiling, setIsRecoiling] = useState(false);
  const recoilTime = useRef(0);
  const shootSound = useRef(null);

  // Load and apply textures
  useEffect(() => {
    // Load shoot sound
    const audio = new Audio("/shot.mp3");
    audio.volume = 0.7;
    shootSound.current = audio;

    if (gunRef.current) {
      const textureLoader = new THREE.TextureLoader();

      // Load beretta (gun) textures
      const berettaColor = textureLoader.load("/textures/berettaColor.png");
      const berettaNormal = textureLoader.load("/textures/berettaNormal.png");
      const berettaMetallic = textureLoader.load("/textures/berettaMetallic.png");
      const berettaRoughness = textureLoader.load("/textures/berettaRoughness.png");
      const berettaAO = textureLoader.load("/textures/berettaAO.png");

      // Load arms textures
      const armsColor = textureLoader.load("/textures/armsColor.png");
      const armsNormal = textureLoader.load("/textures/armsNormal.png");
      const armsRoughness = textureLoader.load("/textures/armsRoughness.png");
      const armsAO = textureLoader.load("/textures/armsAO.png");

      // Apply textures to materials
      gunRef.current.traverse(child => {
        if (child.isMesh && child.material) {
          const material = child.material;

          if (material.name === "beretta") {
            // Apply beretta textures
            material.map = berettaColor;
            material.normalMap = berettaNormal;
            material.metalnessMap = berettaMetallic;
            material.roughnessMap = berettaRoughness;
            material.aoMap = berettaAO;

            // Set material properties for realistic gun metal
            material.metalness = 1.0;
            material.roughness = 0.4;
            material.aoMapIntensity = 1.0;

            // Enable shadows
            child.castShadow = true;
            child.receiveShadow = true;

            material.needsUpdate = true;
          }

          if (material.name === "arms") {
            // Apply arms textures
            material.map = armsColor;
            material.normalMap = armsNormal;
            material.roughnessMap = armsRoughness;
            material.aoMap = armsAO;

            // Set material properties for skin
            material.metalness = 0.0;
            material.roughness = 0.8;
            material.aoMapIntensity = 1.0;

            // Enable shadows
            child.castShadow = true;
            child.receiveShadow = true;

            material.needsUpdate = true;
          }
        }
      });
    }

    // Add mouse click event listener for shooting
    const handleMouseClick = event => {
      if (event.button === 0 && isVisible) {
        // Left mouse button
        shoot();
      }
    };

    document.addEventListener("mousedown", handleMouseClick);

    return () => {
      document.removeEventListener("mousedown", handleMouseClick);
      if (shootSound.current) {
        shootSound.current = null;
      }
    };
  }, [isVisible]);

  // Shoot function
  const shoot = () => {
    if (isRecoiling) return; // Prevent shooting while already recoiling

    // Play shoot sound
    if (shootSound.current) {
      shootSound.current.currentTime = 0; // Reset to beginning
      shootSound.current.play().catch(error => {
        console.log("Failed to play shoot sound:", error);
      });
    }

    // Perform raycast from camera center
    const raycaster = new THREE.Raycaster();
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyQuaternion(camera.quaternion);

    raycaster.set(camera.position, direction);
    const intersects = raycaster.intersectObjects(scene.children, true);

    console.log(
      "All intersects:",
      intersects.map(i => ({
        object: i.object,
        userData: i.object.userData,
        isEntity: i.object.userData?.isEntity,
      }))
    );

    // Filter out gun and non-solid objects
    const validIntersects = intersects.filter(intersect => {
      const object = intersect.object;
      // Exclude the gun itself and lights, but include the entity
      return (
        !object.isLight &&
        !object.isCamera &&
        !gunRef.current?.children.some(child => child === object || child.children.includes(object)) &&
        (object.userData?.isEntity || (object.geometry && object.material)) &&
        object.visible
      );
    });

    console.log(
      "Valid intersects:",
      validIntersects.map(i => ({
        object: i.object,
        userData: i.object.userData,
        isEntity: i.object.userData?.isEntity,
      }))
    );

    if (validIntersects.length > 0 && onShoot) {
      const hit = validIntersects[0];
      onShoot(hit, camera.position);
    }

    // Start recoil animation
    setIsRecoiling(true);
    recoilTime.current = 0;

    // Stop recoil after a short duration
    setTimeout(() => {
      setIsRecoiling(false);
    }, 200); // 200ms recoil duration
  };

  useFrame((_, delta) => {
    if (!gunRef.current || !isVisible) return;

    // Increment sway timer
    swayTime.current += delta;

    // Breathing sway amount (sinusoidal vertical movement)
    const swayY = Math.sin(swayTime.current * 2) * 0.01;

    // Base position from camera
    const gunPosition = new THREE.Vector3();
    camera.getWorldPosition(gunPosition);

    const forward = new THREE.Vector3(0, 0, -1);
    const right = new THREE.Vector3(1, 0, 0);
    const down = new THREE.Vector3(0, -1, 0);

    forward.applyQuaternion(camera.quaternion);
    right.applyQuaternion(camera.quaternion);
    down.applyQuaternion(camera.quaternion);

    gunPosition.add(forward.multiplyScalar(0.5));
    gunPosition.add(right.multiplyScalar(0.3));
    gunPosition.add(down.multiplyScalar(0.2 + swayY));

    // Handle recoil animation
    let recoilOffset = new THREE.Vector3();
    let recoilRotation = { x: 0, y: 0, z: 0 };

    if (isRecoiling) {
      recoilTime.current += delta;

      // Recoil parameters
      const recoilDuration = 0.2; // 200ms
      const recoilProgress = Math.min(recoilTime.current / recoilDuration, 1);

      // Easing function for smooth recoil (ease-out)
      const easedProgress = 1 - Math.pow(1 - recoilProgress, 3);

      // Recoil movements
      const maxBackwardRecoil = 0.15; // Move gun backward
      const maxUpwardRecoil = 0.08; // Move gun up slightly
      const maxRotationRecoil = -0.3; // Rotate gun up

      // Calculate recoil offsets (reverse the motion for return effect)
      const backwardRecoil = Math.sin(easedProgress * Math.PI) * maxBackwardRecoil;
      const upwardRecoil = Math.sin(easedProgress * Math.PI) * maxUpwardRecoil;
      const rotationRecoil = Math.sin(easedProgress * Math.PI) * maxRotationRecoil;

      // Apply recoil to position
      recoilOffset.add(forward.clone().multiplyScalar(-backwardRecoil)); // Push backward
      recoilOffset.add(down.clone().multiplyScalar(-upwardRecoil)); // Push up

      // Apply recoil to rotation
      recoilRotation.x = -rotationRecoil; // Rotate gun upward
      recoilRotation.z = (Math.random() - 0.5) * 0.1; // Small random roll
    }

    // Apply final position with recoil
    gunPosition.add(recoilOffset);
    gunRef.current.position.copy(gunPosition);

    // Apply rotation via quaternion to prevent flipping
    gunRef.current.quaternion.copy(camera.quaternion);
    gunRef.current.rotateX(0.1 + recoilRotation.x); // Slight downward tilt + recoil
    gunRef.current.rotateY(Math.PI); // Face forward
    gunRef.current.rotateZ(recoilRotation.z); // Add recoil roll
  });

  if (!isVisible) return null;

  return (
    <group ref={gunRef}>
      {/* Enhanced lighting for better texture visibility */}
      <pointLight position={[0.3, 0.2, 0.4]} intensity={1.5} distance={3} decay={1} color='#ffffff' />
      <pointLight position={[-0.2, -0.1, 0.3]} intensity={1.0} distance={2} decay={2} color='#fff8dc' />
      <GunModel scale={[1, 1, 1]} />
    </group>
  );
}

// Blood effect component
function BloodEffect({ position, onComplete }) {
  const bloodRef = useRef();
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    // Load blood texture
    const textureLoader = new THREE.TextureLoader();
    const bloodTexture = textureLoader.load("/blood.png");

    if (bloodRef.current) {
      bloodRef.current.material.map = bloodTexture;
      bloodRef.current.material.transparent = true;
      bloodRef.current.material.needsUpdate = true;
    }

    // Fade out blood effect over 3 seconds
    const fadeInterval = setInterval(() => {
      setOpacity(prev => {
        const newOpacity = prev - 0.02;
        if (newOpacity <= 0) {
          clearInterval(fadeInterval);
          if (onComplete) onComplete();
          return 0;
        }
        return newOpacity;
      });
    }, 50);

    return () => clearInterval(fadeInterval);
  }, [onComplete]);

  useEffect(() => {
    if (bloodRef.current) {
      bloodRef.current.material.opacity = opacity;
    }
  }, [opacity]);

  return (
    <mesh ref={bloodRef} position={position}>
      <planeGeometry args={[0.3, 0.3]} />
      <meshBasicMaterial side={THREE.DoubleSide} />
    </mesh>
  );
}

// Bullet hole component
function BulletHole({ position, normal, cameraPosition, onComplete }) {
  const holeRef = useRef();
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    // Load hole texture
    const textureLoader = new THREE.TextureLoader();
    const holeTexture = textureLoader.load("/hole.png");

    if (holeRef.current) {
      holeRef.current.material.map = holeTexture;
      holeRef.current.material.transparent = true;
      holeRef.current.material.needsUpdate = true;

      // Orient the hole to face towards the camera (player)
      holeRef.current.lookAt(cameraPosition);
    }

    // Remove bullet hole after 10 seconds
    const removeTimeout = setTimeout(() => {
      if (onComplete) onComplete();
    }, 10000);

    return () => clearTimeout(removeTimeout);
  }, [position, normal, cameraPosition, onComplete]);

  return (
    <mesh ref={holeRef} position={position}>
      <planeGeometry args={[0.15, 0.15]} />
      <meshBasicMaterial side={THREE.DoubleSide} />
    </mesh>
  );
}

function Entity({ playerPosition, onCatch, onDistanceUpdate }) {
  const entityRef = useRef();
  const entitySpeed = 2.5; // Slightly slower than player for tension
  const catchDistance = 1.2; // Distance at which entity catches player

  useEffect(() => {
    // Load entity texture
    const textureLoader = new THREE.TextureLoader();
    const entityTexture = textureLoader.load("/good.png");

    if (entityRef.current) {
      // Apply texture to entity material
      entityRef.current.material.map = entityTexture;
      entityRef.current.material.transparent = true;
      entityRef.current.material.needsUpdate = true;
    }
  }, []);

  useFrame((state, delta) => {
    if (!entityRef.current || !playerPosition) return;

    const entityPosition = entityRef.current.position;

    // Calculate direction to player
    const direction = new Vector3().subVectors(playerPosition, entityPosition).normalize();

    // Move entity towards player
    const movement = direction.multiplyScalar(entitySpeed * delta);
    entityRef.current.position.add(movement);

    // Make entity always face the player
    entityRef.current.lookAt(playerPosition);

    // Calculate distance to player and update audio
    const distanceToPlayer = entityPosition.distanceTo(playerPosition);
    if (onDistanceUpdate) {
      onDistanceUpdate(distanceToPlayer);
    }

    // Check if entity caught the player
    if (distanceToPlayer < catchDistance) {
      onCatch();
    }
  });

  return (
    <mesh ref={entityRef} position={[10, 1.5, 10]}>
      <planeGeometry args={[3, 2]} />
      <meshBasicMaterial side={THREE.DoubleSide} />
    </mesh>
  );
}

// Death Screen component - instant black screen, then TV image after 3 seconds, then join text after 6 seconds
function DeathScreen({ onJoin }) {
  const [showTV, setShowTV] = useState(false);
  const [showJoinText, setShowJoinText] = useState(false);

  useEffect(() => {
    // Automatically unlock cursor when death screen appears
    if (document.pointerLockElement) {
      document.exitPointerLock();
    }

    // Show TV image after 3 seconds
    const tvTimeout = setTimeout(() => {
      setShowTV(true);
    }, 3000);

    // Show join text after 6 seconds
    const joinTextTimeout = setTimeout(() => {
      setShowJoinText(true);
    }, 6000);

    return () => {
      clearTimeout(tvTimeout);
      clearTimeout(joinTextTimeout);
    };
  }, []);

  const handleClick = () => {
    if (showJoinText && onJoin) {
      onJoin();
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "black",
        zIndex: 10000,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: showJoinText ? "pointer" : "default",
        overflow: "hidden",
      }}
    >
      {showTV && (
        <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
          <img
            src='/tv2.png'
            alt='TV'
            style={{
              width: "100vw",
              height: "100vh",
              objectFit: "cover",
              display: "block",
            }}
          />
          {showJoinText && (
            <div
              style={{
                position: "absolute",
                bottom: "10%",
                left: "50%",
                transform: "translateX(-50%)",
                color: "white",
                fontSize: "24px",
                fontFamily: "Arial, sans-serif",
                fontWeight: "bold",
                textAlign: "center",
                textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                animation: "pulse 2s infinite",
                userSelect: "none",
                whiteSpace: "nowrap",
              }}
            >
              tap anywhere to join
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

// Audio Manager Component with dynamic volume based on entity distance (no UI)
function AudioManager({ entityDistance, gameOver, onAudioStop }) {
  const audioRef = useRef(null);
  const breathRef = useRef(null);
  const deathSoundRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    // Create background music audio element
    const audio = new Audio("/bgmusic.mp3");
    audio.loop = true;
    audio.volume = 0.001; // Start very quiet
    audioRef.current = audio;

    // Create breathing sound audio element
    const breathAudio = new Audio("/breath.mp3");
    breathAudio.loop = true;
    breathAudio.volume = 0; // Start at 0 for fade in
    breathRef.current = breathAudio;

    // Create death sound audio element
    const deathAudio = new Audio("/ded.mp3");
    deathAudio.volume = 1.0; // Full volume for death sound
    deathSoundRef.current = deathAudio;

    // Try to play background music immediately (will fail without user interaction)
    const tryAutoPlay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.log("Autoplay blocked, waiting for user interaction");
      }
    };

    tryAutoPlay();

    // Start breathing sound after 3 seconds with fade in
    const breathTimeout = setTimeout(() => {
      const startBreathingSound = async () => {
        try {
          await breathAudio.play();

          // Fade in the breathing sound over 2 seconds
          const fadeInDuration = 2000; // 2 seconds
          const targetVolume = 0.9; // Reduced volume for breathing
          const fadeSteps = 60; // Number of steps for smooth fade
          const stepTime = fadeInDuration / fadeSteps;
          const volumeStep = targetVolume / fadeSteps;

          let currentStep = 0;
          const fadeInterval = setInterval(() => {
            currentStep++;
            const newVolume = Math.min(volumeStep * currentStep, targetVolume);
            breathAudio.volume = newVolume;

            if (currentStep >= fadeSteps) {
              clearInterval(fadeInterval);
            }
          }, stepTime);
        } catch (error) {
          console.log("Failed to play breathing sound:", error);
        }
      };

      startBreathingSound();
    }, 3000); // 3 seconds delay

    // Listen for any user interaction to enable audio
    const handleInteraction = async () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        try {
          await audio.play();
          setIsPlaying(true);
        } catch (error) {
          console.log("Failed to play audio:", error);
        }
      }
    };

    // Add event listeners for user interaction
    document.addEventListener("click", handleInteraction);
    document.addEventListener("keydown", handleInteraction);
    document.addEventListener("touchstart", handleInteraction);

    return () => {
      clearTimeout(breathTimeout);
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (breathRef.current) {
        if (breathRef.current.stopTimeout) {
          clearTimeout(breathRef.current.stopTimeout);
        }
        breathRef.current.pause();
        breathRef.current = null;
      }
      if (deathSoundRef.current) {
        if (deathSoundRef.current.timeout) {
          clearTimeout(deathSoundRef.current.timeout);
        }
        if (deathSoundRef.current.breathTimeout) {
          clearTimeout(deathSoundRef.current.breathTimeout);
        }
        if (deathSoundRef.current.allStopTimeout) {
          clearTimeout(deathSoundRef.current.allStopTimeout);
        }
        deathSoundRef.current.pause();
        deathSoundRef.current = null;
      }
    };
  }, [hasInteracted]);

  // Handle game over - stop all audio and play death sound sequence
  useEffect(() => {
    if (gameOver) {
      // Stop all existing audio immediately
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      }
      if (breathRef.current) {
        breathRef.current.pause();
        breathRef.current.currentTime = 0;
      }

      // Play death sound immediately
      if (deathSoundRef.current) {
        deathSoundRef.current.currentTime = 0;
        deathSoundRef.current.volume = 1.0;

        const playDeathSound = async () => {
          try {
            await deathSoundRef.current.play();
            console.log("Death sound started playing");
          } catch (error) {
            console.log("Failed to play death sound:", error);
          }
        };

        playDeathSound();

        // Stop death sound after 3 seconds
        const deathSoundTimeout = setTimeout(() => {
          if (deathSoundRef.current) {
            deathSoundRef.current.pause();
            deathSoundRef.current.currentTime = 0;
            console.log("Death sound stopped after 3 seconds");
          }
        }, 3000);

        // Start breathing sound after 2 seconds
        const breathStartTimeout = setTimeout(() => {
          if (breathRef.current) {
            breathRef.current.currentTime = 0;
            breathRef.current.volume = 0.9;

            const playBreathSound = async () => {
              try {
                await breathRef.current.play();
                console.log("Breath sound started playing");
              } catch (error) {
                console.log("Failed to play breath sound:", error);
              }
            };

            playBreathSound();
          }
        }, 2000);

        // Stop ALL audio after 6 seconds
        const allAudioStopTimeout = setTimeout(() => {
          console.log("Stopping all audio after 6 seconds");
          if (deathSoundRef.current) {
            deathSoundRef.current.pause();
            deathSoundRef.current.currentTime = 0;
          }
          if (breathRef.current) {
            breathRef.current.pause();
            breathRef.current.currentTime = 0;
          }
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
          }
          console.log("All audio stopped - ready for join text");
        }, 6000);

        // Store timeouts for cleanup
        deathSoundRef.current.timeout = deathSoundTimeout;
        deathSoundRef.current.breathTimeout = breathStartTimeout;
        deathSoundRef.current.allStopTimeout = allAudioStopTimeout;
      }

      // Notify that audio has stopped
      if (onAudioStop) {
        onAudioStop();
      }
    }
  }, [gameOver, onAudioStop]);

  // Update audio volume based on entity distance (only if not game over)
  useEffect(() => {
    if (!audioRef.current || !isPlaying || gameOver) return;

    // Calculate volume based on entity distance
    // When entity is far (distance > 20), volume is very low (0.05)
    // When entity is close (distance < 5), volume is high (0.8)
    const maxDistance = 8; // Maximum distance for volume calculation
    const minDistance = 2; // Minimum distance for maximum volume
    const minVolume = 0.001; // Minimum volume when entity is far
    const maxVolume = 0.8; // Maximum volume when entity is close

    let volume = minVolume;

    if (entityDistance !== null) {
      if (entityDistance <= minDistance) {
        volume = maxVolume;
      } else if (entityDistance >= maxDistance) {
        volume = minVolume;
      } else {
        // Linear interpolation between min and max volume
        const normalizedDistance = (entityDistance - minDistance) / (maxDistance - minDistance);
        volume = maxVolume - normalizedDistance * (maxVolume - minVolume);
      }
    }

    // Smooth volume transition
    const currentVolume = audioRef.current.volume;
    const volumeDiff = volume - currentVolume;
    const smoothingFactor = 0.1; // Adjust for smoother/faster transitions

    audioRef.current.volume = currentVolume + volumeDiff * smoothingFactor;
  }, [entityDistance, isPlaying, gameOver]);

  // Audio manager runs silently with no UI
  return null;
}

// First person character controller with collision detection and running animation
function FirstPersonControls({ onPositionUpdate, gameOver }) {
  const { camera, scene } = useThree();
  const moveSpeed = 5;
  const playerRadius = 0.3; // Collision radius around player
  const baseHeight = 1.6; // Base camera height (eye level)
  const bobAmplitude = 0.08; // How much the camera bobs up and down
  const bobFrequency = 8; // How fast the bobbing occurs
  const bobTimeRef = useRef(0); // Track time for bobbing animation
  const isMovingRef = useRef(false); // Track if player is moving

  const keys = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = event => {
      if (gameOver) return; // Disable movement when game is over

      switch (event.code) {
        case "KeyW":
        case "ArrowUp":
          keys.current.forward = true;
          break;
        case "KeyS":
        case "ArrowDown":
          keys.current.backward = true;
          break;
        case "KeyA":
        case "ArrowLeft":
          keys.current.left = true;
          break;
        case "KeyD":
        case "ArrowRight":
          keys.current.right = true;
          break;
      }
    };

    const handleKeyUp = event => {
      if (gameOver) return; // Disable movement when game is over

      switch (event.code) {
        case "KeyW":
        case "ArrowUp":
          keys.current.forward = false;
          break;
        case "KeyS":
        case "ArrowDown":
          keys.current.backward = false;
          break;
        case "KeyA":
        case "ArrowLeft":
          keys.current.left = false;
          break;
        case "KeyD":
        case "ArrowRight":
          keys.current.right = false;
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameOver]);

  // Check for collisions using raycasting
  const checkCollision = newPosition => {
    const raycaster = new THREE.Raycaster();
    const directions = [
      new Vector3(1, 0, 0), // right
      new Vector3(-1, 0, 0), // left
      new Vector3(0, 0, 1), // forward
      new Vector3(0, 0, -1), // backward
      new Vector3(0.707, 0, 0.707), // diagonal
      new Vector3(-0.707, 0, 0.707), // diagonal
      new Vector3(0.707, 0, -0.707), // diagonal
      new Vector3(-0.707, 0, -0.707), // diagonal
    ];

    // Check collision in multiple directions around the player
    for (const direction of directions) {
      raycaster.set(newPosition, direction);
      const intersects = raycaster.intersectObjects(scene.children, true);

      // Filter out non-solid objects (lights, cameras, etc.)
      const solidIntersects = intersects.filter(intersect => {
        const object = intersect.object;
        // Check if object has geometry and is likely a wall/floor
        return object.geometry && object.material && !object.isLight && !object.isCamera && object.visible;
      });

      if (solidIntersects.length > 0 && solidIntersects[0].distance < playerRadius) {
        return true; // Collision detected
      }
    }
    return false; // No collision
  };

  // Update camera position based on input with collision detection and running animation
  useFrame((state, delta) => {
    if (gameOver) return; // Stop movement when game is over

    const velocity = new Vector3();
    const direction = new Vector3();

    camera.getWorldDirection(direction);
    direction.y = 0; // Keep movement horizontal
    direction.normalize();

    const right = new Vector3();
    right.crossVectors(direction, camera.up).normalize();

    if (keys.current.forward) velocity.add(direction);
    if (keys.current.backward) velocity.sub(direction);
    if (keys.current.right) velocity.add(right);
    if (keys.current.left) velocity.sub(right);

    // Check if player is moving
    const isMoving = velocity.length() > 0;
    isMovingRef.current = isMoving;

    if (isMoving) {
      velocity.normalize();
      velocity.multiplyScalar(moveSpeed * delta);

      // Calculate new position
      const newPosition = camera.position.clone().add(velocity);

      // Check for collision before moving
      if (!checkCollision(newPosition)) {
        camera.position.copy(newPosition);
      } else {
        // Try moving in individual axes if diagonal movement is blocked
        const xMovement = new Vector3(velocity.x, 0, 0);
        const zMovement = new Vector3(0, 0, velocity.z);

        const xPosition = camera.position.clone().add(xMovement);
        const zPosition = camera.position.clone().add(zMovement);

        if (!checkCollision(xPosition)) {
          camera.position.add(xMovement);
        } else if (!checkCollision(zPosition)) {
          camera.position.add(zMovement);
        }
        // If both individual axes are blocked, don't move
      }
    }

    // Handle running animation (head bob)
    if (isMovingRef.current) {
      // Increment bob time when moving
      bobTimeRef.current += delta * bobFrequency;

      // Calculate bobbing offset using sine wave
      const bobOffset = Math.sin(bobTimeRef.current) * bobAmplitude;

      // Apply bobbing to camera Y position
      camera.position.y = baseHeight + bobOffset;
    } else {
      // When not moving, gradually return to base height
      const currentHeight = camera.position.y;
      const heightDiff = baseHeight - currentHeight;

      // Smooth interpolation back to base height
      if (Math.abs(heightDiff) > 0.001) {
        camera.position.y += heightDiff * delta * 5; // Smooth return
      } else {
        camera.position.y = baseHeight;
      }

      // Reset bob time when not moving
      bobTimeRef.current = 0;
    }

    // Update player position for entity tracking
    if (onPositionUpdate) {
      onPositionUpdate(camera.position.clone());
    }
  });

  return null;
}

// Instructions component
function Instructions({ gameOver }) {
  if (gameOver) return null; // Hide instructions when game is over

  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        color: "white",
        fontFamily: "Arial, sans-serif",
        fontSize: "14px",
        background: "rgba(0, 0, 0, 0.7)",
        padding: "15px",
        borderRadius: "8px",
        zIndex: 1000,
        maxWidth: "300px",
      }}
    >
      <div style={{ marginBottom: "10px", fontWeight: "bold" }}>🎮 Controls</div>
      <div>• Click to lock mouse cursor</div>
      <div>• WASD or Arrow Keys to move</div>
      <div>• Mouse to look around</div>
      <div>• Left Click to shoot</div>
      <div>• ESC to unlock cursor</div>
      <div style={{ marginTop: "10px", fontSize: "12px", opacity: "0.8" }}>🎵 Music volume increases as entity gets closer!</div>
    </div>
  );
}

const App = () => {
  const [playerPosition, setPlayerPosition] = useState(new Vector3(0, 1.6, 0));
  const [entityDistance, setEntityDistance] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [showGun, setShowGun] = useState(true);
  const [bloodEffects, setBloodEffects] = useState([]);
  const [bulletHoles, setBulletHoles] = useState([]);
  const [showJoinPage, setShowJoinPage] = useState(false);
  const [showWarning, setShowWarning] = useState(true); // Show warning on load
  const [gameStarted, setGameStarted] = useState(false); // Control entity spawning

  // Entity ref for shooting detection
  const entityRef = useRef();

  const handleEntityCatch = () => {
    setGameOver(true);
  };

  const handleDistanceUpdate = distance => {
    setEntityDistance(distance);
  };

  const handlePositionUpdate = position => {
    setPlayerPosition(position);
  };

  const handleAudioStop = () => {
    // Called when all audio has been stopped due to death
    console.log("All audio stopped, player is dead");
  };

  const handleJoin = () => {
    console.log("Redirecting to join page");
    setShowJoinPage(true);
  };

  const handleWarningAccept = () => {
    setShowWarning(false);
    setGameStarted(true); // Start the game and spawn entity
  };

  // Show join page if requested
  if (showJoinPage) {
    return <Join />;
  }

  // Handle shooting hits
  const handleShoot = (hit, cameraPosition) => {
    if (gameOver) return; // Don't allow shooting when dead

    const hitObject = hit.object;
    const hitPoint = hit.point;
    const hitNormal = hit.face.normal;

    console.log("Hit object:", hitObject);
    console.log("Hit object userData:", hitObject.userData);
    console.log("Is entity:", hitObject.userData?.isEntity);

    // Check if entity was hit
    if (hitObject.userData?.isEntity) {
      console.log("Creating blood effect at:", hitPoint);
      // Add blood effect at hit location
      const bloodId = Date.now() + Math.random();
      setBloodEffects(prev => [
        ...prev,
        {
          id: bloodId,
          position: hitPoint.clone(),
        },
      ]);
    } else {
      console.log("Creating bullet hole at:", hitPoint);
      // Add bullet hole for wall hits
      const holeId = Date.now() + Math.random();
      // Offset the hole slightly from the surface to prevent z-fighting
      const offsetPosition = hitPoint.clone().add(hitNormal.clone().multiplyScalar(0.01));
      setBulletHoles(prev => [
        ...prev,
        {
          id: holeId,
          position: offsetPosition,
          normal: hitNormal.clone(),
          cameraPosition: cameraPosition.clone(),
        },
      ]);
    }
  };

  // Remove blood effect
  const removeBloodEffect = id => {
    setBloodEffects(prev => prev.filter(effect => effect.id !== id));
  };

  // Remove bullet hole
  const removeBulletHole = id => {
    setBulletHoles(prev => prev.filter(hole => hole.id !== id));
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* Warning Dialog */}
      {showWarning && <WarningDialog onAccept={handleWarningAccept} />}

      {/* Silent audio manager - no UI */}
      <AudioManager entityDistance={entityDistance} gameOver={gameOver} onAudioStop={handleAudioStop} />

      {/* Death screen with join functionality */}
      {gameOver && <DeathScreen onJoin={handleJoin} />}

      <Canvas
        camera={{
          fov: 75,
          position: [0, 1.6, 0], // Spawn at eye level (average human height)
          rotation: [0, 0, 0], // Look straight ahead
          near: 0.1,
          far: 1000,
        }}
        onCreated={({ camera }) => {
          // Ensure camera looks straight ahead on startup
          camera.rotation.set(0, 0, 0);
          camera.lookAt(0, 1.6, -1); // Look forward (negative Z direction)
        }}
      >
        {/* Enhanced atmospheric lighting for better texture visibility */}
        <ambientLight intensity={0.4} color='#fff8dc' />
        <directionalLight position={[5, 5, 5]} intensity={0.6} color='#fff8dc' castShadow />
        <directionalLight position={[-5, 3, -5]} intensity={0.3} color='#f4e4bc' />

        {/* Pointer lock controls for first person view */}
        <PointerLockControls />

        {/* First person movement controller */}
        <FirstPersonControls onPositionUpdate={handlePositionUpdate} gameOver={gameOver} />

        {/* The backrooms model */}
        <Model />

        {/* The gun model - hidden when game is over */}
        {!gameOver && <Gun isVisible={showGun} onShoot={handleShoot} />}

        {/* The entity that follows the player - only spawns when game started and not game over */}
        {gameStarted && !gameOver && (
          <Entity
            playerPosition={playerPosition}
            onCatch={handleEntityCatch}
            onDistanceUpdate={handleDistanceUpdate}
            entityRef={entityRef}
          />
        )}

        {/* Blood effects */}
        {bloodEffects.map(effect => (
          <BloodEffect key={effect.id} position={effect.position} onComplete={() => removeBloodEffect(effect.id)} />
        ))}

        {/* Bullet holes */}
        {bulletHoles.map(hole => (
          <BulletHole
            key={hole.id}
            position={hole.position}
            normal={hole.normal}
            cameraPosition={hole.cameraPosition}
            onComplete={() => removeBulletHole(hole.id)}
          />
        ))}
      </Canvas>
    </div>
  );
};

export default App;
