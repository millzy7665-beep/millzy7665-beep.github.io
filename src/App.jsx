import { useState, useEffect, useRef, useCallback } from "react";
import {
  BookOpen, Shield, AlertTriangle, ChevronRight, ChevronLeft,
  Award, Brain, Eye, Gauge, Heart, Target, MapPin, Settings,
  FileText, RotateCcw, Star, TrendingUp, Check, X, Clock,
  Bike, Home, CheckCircle, Zap, Menu, Info, QrCode,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import "./animations.css";

// Network IP injected by Vite define at build/serve time
/* global __LOCAL_IP__, __SECURE_SHARE_URL__ */
const NETWORK_IP = typeof __LOCAL_IP__ !== "undefined" ? __LOCAL_IP__ : null;
const SECURE_SHARE_URL = typeof __SECURE_SHARE_URL__ !== "undefined" ? __SECURE_SHARE_URL__ : null;

// ─── PALETTE ──────────────────────────────────────────────────────────
const C = {
  bg:       "#06080F",
  surface:  "#0B1220",
  card:     "#0F1929",
  border:   "#192840",
  border2:  "#243355",
  text:     "#EFF3FF",
  muted:    "#7A91BB",
  dim:      "#3A4F70",
  gold:     "#C9A84C",
  goldL:    "#E8C456",
  sky:      "#38BDF8",
  violet:   "#A78BFA",
  emerald:  "#34D399",
  amber:    "#FBBF24",
  rose:     "#FB7185",
  red:      "#F87171",
};

// ─── PHOTOS ───────────────────────────────────────────────────────────
const _P = (id, w, h) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
const PHOTOS = {
  hero:             _P("1558980394-4c7c9299fe96", 900, 480),
  welcome:          _P("1558980394-4c7c9299fe96", 400, 200),
  licensing:        _P("1558980664-2cd663cf8dde", 400, 200),
  rules:            _P("1558980394-4c7c9299fe96", 400, 200),
  "before-ride":    _P("1558980664-2cd663cf8dde", 400, 200),
  "ride-abilities": _P("1558981033-0f0309284409", 400, 200),
  "safe-practices": _P("1558981403-c5f9899a28bc", 400, 200),
  "crash-avoidance":_P("1558981359-219d6364c9c8", 400, 200),
  impaired:         _P("1558981403-c5f9899a28bc", 400, 200),
  emergency:        _P("1558981033-0f0309284409", 400, 200),
  practical:        _P("1558980664-2cd663cf8dde", 400, 200),
  resources:        _P("1558981033-0f0309284409", 400, 200),
};

function getShareUrl() {
  if (typeof window === "undefined") return "";

  // A secure URL is required for reliable mobile app installation.
  if (SECURE_SHARE_URL && SECURE_SHARE_URL.startsWith("https://")) return SECURE_SHARE_URL;

  const origin = window.location.origin;
  const originIsSecure = window.location.protocol === "https:";
  if (originIsSecure) return origin;

  const port = window.location.port || "5173";
  const host = window.location.hostname;
  const isLocalHost = host === "localhost" || host === "127.0.0.1";
  const networkHost = NETWORK_IP || (!isLocalHost ? host : "");
  if (!networkHost) return "";
  return `http://${networkHost}:${port}`;
}

// ─── DATA ─────────────────────────────────────────────────────────────
const CHAPTERS = [
  {
    id: "welcome", title: "Welcome", icon: "BookOpen", color: "#38BDF8",
    sections: [
      { title: "Cayman Custom Cycles Motorcycle Handbook",
        content: `Welcome to your interactive Motorcycle Rider's Handbook, brought to you by **Cayman Custom Cycles** in partnership with the Cayman Islands Motorcycle Riders Association (CIMRA).

The Cayman Islands offer a climate and weather favorable to motorcycle riders all year. For the safety of the motorcycle operator and those sharing the road with them, training and proper licensing is required by law.

This handbook contains valuable information on techniques to operate a motorcycle safely. Strategies and techniques on managing the riding environment and avoiding crashes are presented along with an introduction to pertinent laws and the Rules of the Road.

**Crash studies show that rider course graduates have far lower injury and fatality rates compared to untrained riders, clearly indicating the value of rider education.**

Alcohol is a significant factor contributing to motorcycle related crashes — 42% of motorcycle riders who died in single-vehicle crashes had BAC levels of .08 or higher. Balance, coordination, vision, judgment — all essential skills needed for safe motorcycle operation can be negatively impacted by consumption of as little as one drink.` },
      { title: "About CIMRA",
        content: `The Cayman Islands Motorcycle Riding Association was organized on November 10, 2000. We are a positive, friendly group of riders — males and females, ages range from the early 20's and up, from all walks of life. We ride a variety of motorcycles including cruisers, touring, sport bikes and scooters.

**Mission:** To create an Association where motorcyclists can enjoy the sport through shared activities and camaraderie. To promote motorcycle safety, project a positive image of motorcycling, promote motorcycling through community involvement and raise the general public's awareness of the sport.

Find CIMRA at: facebook.com/CIMRA` },
    ],
  },
  {
    id: "licensing", title: "Licensing & Registration", icon: "FileText", color: "#A78BFA",
    sections: [
      { title: "Definitions",
        content: `**Motor Vehicle:** Any self-propelled vehicle intended for operation upon public right of way, excluding vehicles moved solely by human power, motorized wheelchairs, and motorized bicycles.

**Motorcycle:** A motor vehicle powered by a motor with a displacement of more than 125 cubic centimeters, having a seat or saddle for the rider, designed to travel on not more than two wheels in contact with the ground.

**Motor Scooter:** A motorcycle powered by a motor with a displacement of 125 cubic centimeters or less.` },
      { title: "Operator Licensing",
        content: `You must be at least **17 years old** to ride a motorcycle having an engine capacity not exceeding 125cc.

**Learner License:** You MUST display 'L' plates whilst riding.

**License Groups:**
• **Group 0** — Mopeds
• **Group 1** — Motorcycles (including mopeds and motor scooters) up to 125cc
• **Group 1A** — Motorcycles in excess of 125cc
• **Group 2** — Motor cars
• **Group 3** — Trucks
• **Group 4** — Special vehicles

**To qualify for Group 1A, you must meet one of these criteria:**
• Hold a full Group 1 license AND complete a basic rider safety course approved by the Director
• Hold a full Group 1 license for at least one year
• Have a full car/truck/special vehicle license — you'll take a practical motorcycle test for Group 1 only
• Provide documentation of a motorcycle operator's license from another recognized jurisdiction` },
      { title: "Motor Vehicle Registration",
        content: `The owner or person in charge of a motor vehicle operated on the public right of way shall register the vehicle in their name. All motorcycles MUST have insurance. Check with your insurance company about your coverage before you buy or ride a motorcycle.` },
    ],
    quiz: [
      { q: "What is the minimum age to ride a motorcycle up to 125cc?", options: ["16 years old","17 years old","18 years old","21 years old"], correct: 1, explanation: "You must be at least 17 years old to ride a motorcycle with an engine capacity not exceeding 125cc." },
      { q: "What must a learner license holder display while riding?", options: ["'S' plates","'L' plates","'P' plates","No plates required"], correct: 1, explanation: "Learner license holders MUST display 'L' plates whilst riding." },
      { q: "Which license group covers motorcycles over 125cc?", options: ["Group 0","Group 1","Group 1A","Group 2"], correct: 2, explanation: "Group 1A covers motorcycles in excess of 125cc." },
      { q: "What is a motorcycle by Cayman Islands law?", options: ["Any two-wheeled vehicle","Motor with displacement over 125cc on two wheels","Any motorized bicycle","A vehicle with a seat and motor"], correct: 1, explanation: "A motorcycle is defined as a motor vehicle powered by a motor with displacement of more than 125cc, having a seat/saddle, designed for not more than two wheels." },
    ],
  },
  {
    id: "rules", title: "Rules of the Road", icon: "Shield", color: "#FB7185",
    sections: [
      { title: "General Road Code",
        content: `In the Cayman Islands, any person operating a motorcycle is subject to the same regulations as any other motor vehicle driver. Drivers from all corners of the world live here where traffic laws can differ — always be alert.

**Key Rules:**
• Minimum age **16** to operate any motor vehicle
• **Drive on the LEFT** side of the road (except one-way streets or overtaking)
• Before making a right-hand turn, give right of way to all vehicles
• Comply with all traffic signals and signs
• Drive at a speed where you can stop in an emergency without collision
• Keep watch on the road behind AND in front
• Give prior warning of any intended maneuver (hand or indicator signals)
• **Turning left on a red light is allowed** after a full stop
• Four-way stops: whoever arrives first, proceeds first
• The center turning lane is for right turns only — NEVER for overtaking` },
      { title: "School Zones & Special Rules",
        content: `• When a school bus has lights flashing, you must NOT pass it (from front or rear)
• **15 mph speed limit** in dedicated school zones when warning lights are flashing
• You must NOT use a hand-held mobile phone while driving (except calling 911 in genuine emergency)
• You must exercise proper control of your vehicle at all times` },
      { title: "Roundabouts",
        content: `Roundabouts are frequent in Cayman. The rules are simple:

• Always travel **clockwise** around a roundabout — NEVER turn right into one!
• All traffic approaching MUST **yield to traffic already in the roundabout**
• Use your indicators when approaching or exiting
• Observe movement of other cars — don't just rely on mirrors
• Keep in formation on multi-lane roundabouts — don't change lanes
• Cars in the right-hand lane have right of way
• If you can't safely exit, **go around again** rather than force your way out
• Once on a roundabout, do NOT stop to admit cars entering from the left` },
      { title: "Motorcycle-Specific Road Code",
        content: `• All motorcycles are entitled to **full use of a lane** — no car may deprive a motorcycle of its lane
• Rider AND passenger must wear an **approved crash helmet** (DOT or ECE standards), securely fastened
• A learner license holder must NOT carry a pillion passenger
• Full license holders may carry **no more than one passenger**, seated facing forward on foot rests
• A passenger should only be carried if the motorcycle is designed/manufactured for it
• Motorcycles may ride **two abreast** in a single lane but NOT more than two
• You shall NOT overtake and pass in the same lane as the vehicle being overtaken
• No person shall operate between lanes of traffic or between rows of vehicles
• **Keep both wheels on the ground at all times**` },
      { title: "Helmet & Equipment Requirements",
        content: `• Everyone MUST wear an approved motorcycle helmet (DOT or ECE)
• You must wear eye protection: goggles, face shields, or eyeglasses (contact lenses are NOT acceptable)
• Tinted devices shall not be used at night
• No headsets, headphones or listening devices that interfere with hearing
• Passenger motorcycles must have footrests and handholds
• Handlebars/handgrips must not be higher than the rider's shoulders
• Required lights: headlight, red rear light, red reflector, brake light, registration plate light, amber turn signals (front & rear)
• No red lights at the front; no white lights (other than reverse or plate light) at the rear` },
    ],
    quiz: [
      { q: "Which side of the road do you drive on in the Cayman Islands?", options: ["Right side","Left side","Either side","Center"], correct: 1, explanation: "In Cayman, you must keep to the LEFT side of the road." },
      { q: "What direction should you travel around a roundabout?", options: ["Counter-clockwise","Clockwise","Either direction","Straight through"], correct: 1, explanation: "Always travel clockwise around a roundabout. Never turn right into one!" },
      { q: "Can a learner license holder carry a pillion passenger?", options: ["Yes, with supervision","Yes, always","No, never","Only on highways"], correct: 2, explanation: "A learner license holder must NOT carry a pillion passenger." },
      { q: "How many motorcycles may ride abreast in a single lane?", options: ["One only","Two maximum","Three maximum","No limit"], correct: 1, explanation: "Motorcycles may operate two abreast in a single lane, but not more than two." },
      { q: "When is turning left on a red light allowed?", options: ["Never","After a full stop","Only with a green arrow","At any time"], correct: 1, explanation: "Turning left on a red light is allowed after coming to a full stop." },
      { q: "What is the speed limit in school zones?", options: ["10 mph","15 mph","20 mph","25 mph"], correct: 1, explanation: "15 mph speed limits have been set in dedicated school zones." },
      { q: "Are contact lenses acceptable as eye protection?", options: ["Yes","No","Only with a windshield","Only during the day"], correct: 1, explanation: "Contact lenses are NOT acceptable eye protection for motorcycle riders." },
      { q: "Who has right of way at a roundabout?", options: ["Traffic entering","Traffic already in the roundabout","The largest vehicle","Traffic on the left"], correct: 1, explanation: "All traffic approaching a roundabout must yield to traffic already in it." },
    ],
  },
  {
    id: "before-ride", title: "Before You Ride", icon: "Settings", color: "#FBBF24",
    sections: [
      { title: "Preparation Checklist",
        content: `Your preparation before a trip determines whether you'll get there safely. Before taking off, always:

• Wear the right protective and safety gear
• Become familiar with the motorcycle controls and equipment
• Check the mechanical condition of the motorcycle
• Ride responsibly — if you are feeling ill, dizzy, or weak, find an alternative` },
      { title: "Helmets & Helmet Use",
        content: `**One out of every five motorcycle crashes results in head or neck injuries.** Head and neck injuries account for a majority of serious and fatal injuries to motorcyclists.

**Facts to consider:**
• An approved helmet lets you see as far to the sides as necessary
• Most crashes happen on **short trips** (less than 5 miles), just minutes after starting
• Most riders are riding **slower than 30 mph** when a crash occurs — helmets cut head injuries by half at these speeds
• Helmeted riders are **3x more likely to survive** head injuries

**Your helmet must:**
• Meet DOT or ECE standards (Snell Memorial Foundation label is a plus)
• Fit snugly all the way around
• Have no cracks, loose padding, or frayed straps
• Be securely fastened when riding` },
      { title: "Pre-Ride Motorcycle Check",
        content: `**Before EVERY ride check:**
• **Tires** — air pressure, tread wear, damage, embedded objects
• **Wheels** — damage, bearing condition, spokes
• **Headlights & Tail-light** — both high and low beams working
• **Turn Signals** — all working properly
• **Brake Light** — both brake controls activate it
• **Brakes** — front and rear feel firm, hold the motorcycle
• **Clutch, Choke & Throttle** — work smoothly, throttle snaps back
• **Mirrors** — clean, adjusted, secure mount
• **Horn** — works properly
• **Fuel supply valve** — turned on before riding` },
      { title: "Clothing",
        content: `**Jacket & Pants:** Cover arms and legs completely. Modern ballistic synthetic mesh jackets provide slide protection AND impact-resistant armor for elbows and spine. Wear a jacket even in warm weather to prevent dehydration.

**Boots/Shoes:** High and sturdy enough to cover ankles. Hard, durable, slip-resistant soles. Short heels. Tuck laces so they won't catch.

**Gloves:** Allow a better grip and protect hands. Leather or durable material, snug fit without extra material interfering with controls.

**Cold/Wet Weather:** Clothes should keep you warm and dry. Good rain suits designed for motorcycle riding resist tearing and ballooning.` },
    ],
    quiz: [
      { q: "How often do most motorcycle crashes happen on short trips?", options: ["Rarely","Most crashes happen on short trips under 5 miles","Only on highways","Only at night"], correct: 1, explanation: "Most crashes happen on short trips (less than 5 miles), just a few minutes after starting out." },
      { q: "How much more likely are helmeted riders to survive head injuries?", options: ["Twice as likely","Three times more likely","Five times more likely","The same"], correct: 1, explanation: "Helmeted riders are three times more likely to survive head injuries." },
      { q: "What should you check before EVERY ride?", options: ["Only the fuel level","Only the tires","Tires, lights, brakes, throttle, mirrors, horn","Nothing if the bike ran yesterday"], correct: 2, explanation: "You should check tires, lights, brakes, clutch/throttle, mirrors, horn, and fuel before every ride." },
      { q: "What should your motorcycle throttle do when you let go?", options: ["Stay in position","Snap back (close)","Open fully","Nothing"], correct: 1, explanation: "The throttle should snap back when you let go. This is a critical safety check." },
      { q: "More than half of all crashes occur on motorcycles ridden by the operator for less than how long?", options: ["One month","Six months","One year","Two years"], correct: 1, explanation: "More than half of all crashes occur on motorcycles ridden by the operator for less than six months." },
    ],
  },
  {
    id: "ride-abilities", title: "Ride Within Your Abilities", icon: "Gauge", color: "#34D399",
    sections: [
      { title: "Body Position",
        content: `To control a motorcycle well:

**Posture:** Sit so you use your arms to steer, not hold yourself up.
**Seat:** Sit far enough forward so arms are slightly bent when holding handle-grips.
**Hands:** Hold grips firmly. Start with right wrist flat to avoid accidental throttle.
**Knees:** Keep against the gas tank to help balance in turns.
**Feet:** Keep firmly on foot-pegs at all times (except when stopped). Don't drag feet.` },
      { title: "Braking",
        content: `Your motorcycle has two brakes — front and rear. **Use both at the same time.**

• The **front brake is more powerful** — provides at least 75% of stopping power
• The front brake is safe when used properly
• **Squeeze** the front brake lever — never grab
• Press down on the rear brake

**In a turn:** If possible, straighten the bike upright first, then brake. If you must brake while leaning, apply brakes lightly and reduce throttle.` },
      { title: "Turning",
        content: `Riders often try to take curves too fast, ending up in another lane or overreacting and braking too hard.

**Approach turns with caution — SLOW, LOOK, PRESS:**
• **SLOW** — Reduce speed before the turn
• **LOOK** — Look through the turn to where you want to go. Turn your head, not shoulders.
• **PRESS** — To lean the motorcycle, press on the handle-grip in the direction of the turn. Press left = lean left = go left.` },
      { title: "Following Distance & Lane Positions",
        content: `**Maintain a minimum of 2 seconds** behind the vehicle ahead.

**To gauge following distance:**
1. Pick a marker on or near the road ahead
2. When the vehicle ahead passes it, count: "one-thousand-one, one-thousand-two"
3. If you reach the marker before "two," you're too close

**Increase to 3+ seconds when:**
• Pavement is slippery
• You can't see through the vehicle ahead
• Traffic is heavy

**Lane position should:**
• Increase your ability to see and be seen
• Avoid others' blind spots
• Avoid surface hazards
• Protect your lane from other drivers` },
      { title: "Passengers & Group Riding",
        content: `**Only experienced riders should carry passengers.** Practice away from traffic first.

**Instruct your passenger to:**
• Get on only after the engine is started
• Sit as far forward as possible without crowding you
• Hold firmly to your waist or belt
• Keep both feet on pegs even when stopped
• Stay directly behind you — avoid unnecessary movement

**Group Riding — Staggered Formation:**
Leader rides in the right side of the lane. Second rider stays 1 second behind in the left side. This keeps the group close with safe distances. Pass one at a time. Single-file for curves, turning, and entering/leaving a highway.` },
    ],
    quiz: [
      { q: "What is the minimum safe following distance?", options: ["1 second","2 seconds","3 seconds","5 seconds"], correct: 1, explanation: "Normally, a minimum of two seconds distance should be maintained behind the vehicle ahead." },
      { q: "How much of your total stopping power does the front brake provide?", options: ["About 25%","About 50%","At least 75%","100%"], correct: 2, explanation: "The front brake provides at least three-quarters (75%) of your total stopping power." },
      { q: "What does 'Press left' do to the motorcycle?", options: ["Turns right","Goes straight","Leans left / goes left","Stops"], correct: 2, explanation: "Press left = lean left = go left. This is called countersteering." },
      { q: "What formation is best for group riding on straight roads?", options: ["Side by side","Staggered formation","Single file","Random"], correct: 1, explanation: "Staggered formation is the best way to keep ranks close yet maintain adequate space cushion." },
    ],
  },
  {
    id: "safe-practices", title: "Safe Riding Practices", icon: "Eye", color: "#818CF8",
    sections: [
      { title: "S.E.E. — Search, Evaluate, Execute",
        content: `Good experienced riders use **S.E.E.** — a three-step process for making appropriate judgments in traffic:

**SEARCH** — Aggressively scan ahead, to the sides, and behind. Focus on finding potential escape routes, especially at intersections, shopping areas, school and construction zones.

**EVALUATE** — Think about how hazards can interact to create risk. Anticipate problems and plan to reduce risk.

**EXECUTE** — Carry out your decision:
• Communicate your presence with lights and/or horn
• Adjust speed by accelerating, stopping, or slowing
• Adjust position and/or direction
• Handle two or more hazards one at a time — adjust speed to let them separate` },
      { title: "Increasing Visibility",
        content: `In crashes with motorcyclists, drivers often say they **never saw the motorcycle.**

**Clothing:** Wear bright-colored clothing — orange, red, yellow, or green jackets/vests are best.

**Headlight:** Keep the headlight on at ALL times. A motorcycle with its light on is **twice as likely to be noticed.** Use high beam during the day.

**Signals:** Use them anytime you change lanes or turn — even when you think no one is around.

**Brake Light:** Flash your brake light before slowing, especially when being followed closely.

**Horn:** Give a quick beep before passing anyone who may move into your lane.` },
      { title: "Riding at Night",
        content: `At night, it's harder to see and be seen.

• **Reduce speed** — ride slower than daytime, especially on unfamiliar roads
• **Increase distance** — open up 3+ second following distance
• **Use the car ahead** — their headlights show the road better than your high beam
• **Use your high beam** whenever not following or meeting a car
• **Be flexible about lane position** — choose whatever portion helps you see, be seen, and maintain a space cushion` },
    ],
    quiz: [
      { q: "What does S.E.E. stand for?", options: ["Speed, Energy, Escape","Search, Evaluate, Execute","Slow, Examine, Exit","Steer, Ease, Engage"], correct: 1, explanation: "S.E.E. stands for Search, Evaluate, Execute — a three-step process for safe riding decisions." },
      { q: "How much more likely is a motorcycle with its headlight on to be noticed?", options: ["50% more likely","Twice as likely","Three times more likely","No difference"], correct: 1, explanation: "During the day, a motorcycle with its light on is twice as likely to be noticed." },
      { q: "Are mirrors sufficient before changing lanes?", options: ["Yes, always","No — you must also do a head check","Only on highways","Only at night"], correct: 1, explanation: "Mirrors are not enough. Before changing lanes, turn your head and look to the side for vehicles in your blind spots." },
    ],
  },
  {
    id: "crash-avoidance", title: "Crash Avoidance", icon: "AlertTriangle", color: "#F87171",
    sections: [
      { title: "Quick Stops",
        content: `To stop quickly, use **both brakes** simultaneously:
• **Squeeze** the front brake lever — NEVER grab
• **Press** down on the rear brake
• Keep the motorcycle straight and upright when possible

If braking while leaning in a curve: apply brakes lightly, reduce throttle. As you slow, reduce lean angle and increase brake pressure until straight.` },
      { title: "Swerving",
        content: `Sometimes you can't stop in time — you may need to swerve (a sudden change in direction).

**To swerve:**
• Apply hand pressure to the handle grip on the side of your escape direction
• Keep your body upright — let the motorcycle lean underneath you
• Make your escape route the target of your vision

**CRITICAL:** Brake before or after swerving — **NEVER while swerving.** Separating braking from swerving is essential.` },
      { title: "Dangerous Surfaces",
        content: `**Slippery Surfaces (wet pavement, gravel, lane markings, manhole covers):**
• Reduce speed before the slippery surface
• Avoid sudden moves — be smooth with speed, shifting, turning, braking
• Use both brakes (squeeze front gently)
• Ride in tire tracks left by cars when wet

**Obstacles:**
• Approach at 90° angle, slow down, keep motorcycle straight
• Rise slightly off seat, roll on throttle slightly just before contact to lighten front end

**Grooves & Gratings:** Relax, maintain steady speed, ride straight across.` },
      { title: "Mechanical Problems",
        content: `**Tire Failure:**
• Front flat: steering feels "heavy" — very hazardous
• Rear flat: back end jerks or sways side to side
• Either tire: hold grips firmly, ease off throttle, keep straight

**Stuck Throttle:**
1. Twist throttle back and forth several times
2. If still stuck: operate engine cut-off switch AND pull in clutch simultaneously
3. Pull off and stop

**Wobble (front wheel shakes):**
• Grip handlebars firmly but don't fight the wobble
• Close throttle gradually — do NOT apply brakes
• Move weight forward and down` },
    ],
    quiz: [
      { q: "When swerving to avoid an obstacle, should you brake at the same time?", options: ["Yes, always","Only the front brake","No — brake before or after, never while swerving","Only the rear brake"], correct: 2, explanation: "Brake before or after swerving — NEVER while swerving. This is critical for maintaining control." },
      { q: "What is the best approach angle for going over an obstacle?", options: ["45 degrees","As close to 90 degrees as possible","Parallel","Any angle"], correct: 1, explanation: "Approach obstacles at as close to a 90° angle as possible to maintain control." },
      { q: "What should you do if your throttle gets stuck?", options: ["Pull in the clutch only","Twist it back and forth, then use engine cut-off switch AND clutch","Jump off the motorcycle","Apply only the rear brake"], correct: 1, explanation: "First twist back and forth. If still stuck, simultaneously use the engine cut-off switch AND pull in the clutch." },
      { q: "If your front tire goes flat while riding, what will you feel?", options: ["The back will sway","Steering feels 'heavy'","Nothing noticeable","The engine will stall"], correct: 1, explanation: "If the front tire goes flat, the steering will feel 'heavy' — this is particularly hazardous." },
    ],
  },
  {
    id: "impaired", title: "Riding Impaired", icon: "AlertTriangle", color: "#EF4444",
    sections: [
      { title: "Alcohol & Drugs",
        content: `Alcohol impairs balance, coordination, vision, and judgment — ALL essential for safe motorcycle operation — with as little as **one drink.**

**Blood Alcohol Concentration (BAC):**
• Your body eliminates approximately one drink per hour
• A smaller person accumulates higher BAC from the same amount
• Impairment of judgment and skills begins well below the legal limit

**Alcohol and the Law in Grand Cayman:**
• A BAC at or above **0.100** is presumed legally intoxicated
• Regardless of BAC, if found driving unsafely you can be charged

**Consequences of Conviction:**
• **First offence:** Fine up to $1,000 OR imprisonment up to 6 months, or both
• **Second/subsequent offence:** Fine of $2,000 AND imprisonment for 12 months, or both
• **Disqualification:** 12 months or longer as the court orders` },
      { title: "Fatigue & Emotions",
        content: `**Fatigue:** Riding a motorcycle is more tiring than driving a car.
• Protect yourself from wind, cold, and rain
• Limit distance — experienced riders seldom ride more than 6 hours a day
• Take rest breaks at least every 2 hours
• Don't use artificial stimulants — they lead to extreme fatigue when wearing off

**Emotions:** Anger, stress, depression, aggression, or euphoria can be dangerous distractions. Caution and prudence are much more under your control than luck.` },
    ],
    quiz: [
      { q: "How many drinks can impair motorcycle riding ability?", options: ["Three or more","Two","As little as one","Five or more"], correct: 2, explanation: "Balance, coordination, vision, and judgment can be negatively impacted by as little as one drink." },
      { q: "What is the presumed legal BAC limit in Grand Cayman?", options: ["0.050","0.080","0.100","0.120"], correct: 2, explanation: "In Grand Cayman, a BAC at or above 0.100 is presumed legally intoxicated." },
      { q: "What is the penalty for a first DUI offence?", options: ["Warning only","Up to $1,000 fine or 6 months imprisonment, or both","$500 fine","License suspension only"], correct: 1, explanation: "First offence: fine up to $1,000 OR imprisonment up to 6 months, or both." },
      { q: "How often should you take rest breaks on a long ride?", options: ["Every 4 hours","Every 2 hours","Every hour","Only when tired"], correct: 1, explanation: "Stop and get off the motorcycle at least every two hours." },
    ],
  },
  {
    id: "emergency", title: "When Bad Things Happen", icon: "Heart", color: "#F43F5E",
    sections: [
      { title: "At a Crash Scene",
        content: `**Secure the Scene:**
• Assess for potential dangers to bystanders, approaching traffic, and those involved
• Mark the site to direct traffic safely around the area
• Identify those involved

**First Aid (ABCs):**
• **Airway** — manage the airway, assure it is open and unobstructed
• **Breathing** — look, listen, and feel for breathing
• **Circulation** — check for a pulse, look for severe bleeding
• **Stabilize** — do NOT move someone with an injury unless they're in imminent danger

**A course in CPR and basic first aid is invaluable.**` },
      { title: "Insurance & Evading Officers",
        content: `**Insurance:** All motorcycles MUST have insurance. Check your coverage before you ride.

**Evading a Peace Officer:** Failure to follow their direction or attempting to evade can place you, the officers, and everyone around you in serious jeopardy. This could result in serious prison sentence, heavy fine, or both.` },
    ],
    quiz: [
      { q: "What are the ABCs of first aid?", options: ["Alert, Bandage, Call","Airway, Breathing, Circulation","Assess, Block, Control","Aid, Balance, Comfort"], correct: 1, explanation: "The ABCs: Airway (open/unobstructed), Breathing (look/listen/feel), Circulation (pulse/bleeding check)." },
      { q: "Should you move an injured person at a crash scene?", options: ["Yes, always","Only to a comfortable position","No, unless they're in imminent danger","Only if they ask"], correct: 2, explanation: "Do NOT move someone with an injury unless their position places them in imminent danger." },
    ],
  },
  {
    id: "practical", title: "Practical Skills & Testing", icon: "Target", color: "#10B981",
    sections: [
      { title: "Riding Exercises",
        content: `**Key principles for all exercises:**
• The course is only cones, paint, and chalk — it's better to go outside a line than drop the bike
• Keep your front wheel on course — the back wheel follows
• Keep head up, eyes focused on WHERE YOU'RE GOING, not where you are
• Do NOT look at lane lines — you'll drive ON them instead of between them
• Use clutch to control speed; go easy on the throttle
• You can drag the rear brake for balance and speed control
• Lean the bike while staying mostly vertical in tight, slow turns
• Keep feet on the pegs — do NOT put your foot down while riding` },
      { title: "The Written Test",
        content: `The written final test consists of multiple-choice questions similar in content to study questions throughout this handbook. Review all chapter study questions with special attention to material you found challenging.

**Remember:** A passing score doesn't mean you know everything. The question you can't answer might make the difference between life or death.` },
      { title: "The Riding Test",
        content: `**Required:** Proper helmet, eye protection, clothing and footwear.

**The test includes:**
• Weaving through cones
• Riding the large circle (clockwise, twice around)
• Large circle counter-clockwise (twice around)
• Gear shift ride (straight path, shift up then down, U-turn, return, smooth stop)

**Tips for success:**
• Keep front wheel between the lanes
• Do NOT put your foot down during exercises
• Use clutch for speed control, very little throttle
• Drag rear brake for balance` },
    ],
    quiz: [
      { q: "Where should you look when riding through a practice course?", options: ["At the lane lines","At your front wheel","Where you're going — ahead of your current position","At the ground"], correct: 2, explanation: "Keep your eyes focused on where you're going, not where you currently are. You go where you look!" },
      { q: "In slow tight turns, should you lean your body or the bike?", options: ["Lean your body","Lean the bike while staying mostly vertical","Lean both equally","Stay perfectly upright"], correct: 1, explanation: "In tight turns at slow speeds, it's usually easier to lean the bike while keeping your body mostly vertical." },
    ],
  },
  {
    id: "resources", title: "Resources", icon: "MapPin", color: "#7C3AED",
    sections: [
      { title: "Cayman Islands Government Agencies",
        content: `**Department of Vehicle & Drivers' Licensing**
990 Crewe Road, George Town, Grand Cayman
Phone: (345) 945-8355
Email: dvdl@gov.ky | Web: www.dvdl.gov.ky

**Royal Cayman Islands Police Service**
80 Shedden Road, George Town
Phone: (345) 244-2964
Web: www.rcips.ky | Email: rcipsinfo@gov.ky` },
      { title: "Motorcycle Community",
        content: `**Cayman Islands Motorcycle Riders Association (CIMRA)**
Web: facebook.com/CIMRA
Email: infocimra@gmail.com

**Cayman Custom Cycles**
Your local source for motorcycles, service, gear, and rider community in Grand Cayman.` },
    ],
  },
];

const ICON_MAP = {
  BookOpen, Shield, AlertTriangle, CheckCircle, FileText,
  Settings, Eye, Gauge, Heart, Target, MapPin, Bike,
};

// ─── HELPERS ──────────────────────────────────────────────────────────
function useAnimKey(dep) {
  const [key, setKey] = useState(0);
  useEffect(() => { setKey(k => k + 1); }, [dep]);
  return key;
}

// ─── PROGRESS RING ────────────────────────────────────────────────────
function ProgressRing({ progress, size = 56, stroke = 5, color = C.emerald, label }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)", display: "block" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.34,1.56,0.64,1)" }} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        fill={color} fontSize={size * 0.24} fontWeight="800"
        style={{ transform: "rotate(90deg)", transformOrigin: "center" }}>
        {label || `${Math.round(progress)}%`}
      </text>
    </svg>
  );
}

// ─── CONTENT RENDERER ─────────────────────────────────────────────────
function ContentRenderer({ text }) {
  const lines = text.split("\n");
  const els = [];
  let k = 0;
  for (const line of lines) {
    const t = line.trim();
    if (!t) { els.push(<div key={k++} style={{ height: 8 }} />); continue; }
    if (t.startsWith("**") && t.endsWith("**") && t.split("**").length === 3) {
      els.push(<p key={k++} style={{ color: C.text, fontWeight: 700, fontSize: 15, marginTop: 16, marginBottom: 6, letterSpacing: -0.2 }}>{t.replace(/\*\*/g, "")}</p>);
      continue;
    }
    if (t.startsWith("•")) {
      const cnt = t.slice(1).trim();
      els.push(
        <div key={k++} style={{ display: "flex", gap: 10, marginBottom: 7, paddingLeft: 2 }}>
          <span style={{ color: C.sky, flexShrink: 0, marginTop: 3, fontSize: 10 }}>◆</span>
          <span style={{ color: "#B0BCDC", fontSize: 14, lineHeight: 1.65 }}
            dangerouslySetInnerHTML={{ __html: cnt.replace(/\*\*(.+?)\*\*/g, `<strong style="color:${C.text}">$1</strong>`) }} />
        </div>
      );
      continue;
    }
    const nm = t.match(/^(\d+)\.\s/);
    if (nm) {
      const cnt = t.slice(nm[0].length);
      els.push(
        <div key={k++} style={{ display: "flex", gap: 10, marginBottom: 7, paddingLeft: 2 }}>
          <span style={{ color: C.sky, fontWeight: 800, flexShrink: 0, minWidth: 18, fontSize: 13 }}>{nm[1]}.</span>
          <span style={{ color: "#B0BCDC", fontSize: 14, lineHeight: 1.65 }}
            dangerouslySetInnerHTML={{ __html: cnt.replace(/\*\*(.+?)\*\*/g, `<strong style="color:${C.text}">$1</strong>`) }} />
        </div>
      );
      continue;
    }
    els.push(
      <p key={k++} style={{ color: "#B0BCDC", fontSize: 14, lineHeight: 1.65, marginBottom: 6 }}
        dangerouslySetInnerHTML={{ __html: t.replace(/\*\*(.+?)\*\*/g, `<strong style="color:${C.text}">$1</strong>`) }} />
    );
  }
  return <div>{els}</div>;
}

// ─── QUIZ ─────────────────────────────────────────────────────────────
function QuizView({ quiz, chapterTitle, chapterColor, onBack, onComplete }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  const q = quiz[current];
  const color = chapterColor || C.sky;

  const handleSelect = (idx) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    const correct = idx === q.correct;
    if (correct) {
      setScore(s => s + 1);
      setStreak(s => { const n = s + 1; if (n > bestStreak) setBestStreak(n); return n; });
    } else {
      setStreak(0);
    }
    setAnswers(a => [...a, { question: q.q, selected: idx, correct: q.correct, isCorrect: correct }]);
  };

  const handleNext = () => {
    if (current < quiz.length - 1) {
      setCurrent(c => c + 1);
      setSelected(null);
      setShowResult(false);
      setAnimKey(k => k + 1);
    } else {
      setFinished(true);
    }
  };

  const handleRetry = () => {
    setCurrent(0); setSelected(null); setShowResult(false);
    setScore(0); setAnswers([]); setFinished(false); setStreak(0); setBestStreak(0); setAnimKey(k => k + 1);
  };

  if (finished) {
    const pct = Math.round((score / quiz.length) * 100);
    const passed = pct >= 80;
    return (
      <div className="anim-scale-in" style={{ padding: "32px 20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 16, animation: "heroFloat 3s ease-in-out infinite" }}>
          {passed ? "🏆" : "📚"}
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: passed ? C.emerald : C.amber, marginBottom: 6, letterSpacing: -0.5 }}>
          {passed ? "Chapter Passed!" : "Keep Studying!"}
        </h2>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 24 }}>{chapterTitle}</p>

        <div style={{ marginBottom: 8 }}>
          <ProgressRing progress={pct} size={120} stroke={8} color={passed ? C.emerald : C.amber} />
        </div>

        <p style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: "12px 0 4px" }}>
          {score} / {quiz.length}
        </p>
        {bestStreak > 1 && (
          <p className="anim-pop-in" style={{ color: C.amber, fontSize: 13, marginBottom: 4 }}>
            🔥 Best streak: {bestStreak} in a row!
          </p>
        )}
        <p style={{ color: C.muted, fontSize: 13, maxWidth: 280, lineHeight: 1.6, margin: "8px auto 28px" }}>
          {passed ? "You're ready for this section of the written test!" : "Review the chapter and try again. You need 80% to pass."}
        </p>

        <div style={{ display: "flex", gap: 10, marginBottom: 32, width: "100%" }}>
          <button onClick={() => { onComplete && onComplete(score); onBack(); }}
            style={btnStyle(C.border, C.border2, C.text, true)}>
            ← Back
          </button>
          <button onClick={handleRetry} style={btnStyle(passed ? "#064E3B" : "#78350F", passed ? C.emerald : C.amber, "#fff")}>
            <RotateCcw size={15} style={{ marginRight: 6, verticalAlign: "middle" }} />Retry
          </button>
        </div>

        {answers.filter(a => !a.isCorrect).length > 0 && (
          <div style={{ width: "100%", textAlign: "left" }} className="anim-slide-in-up">
            <p style={{ color: C.red, fontSize: 13, fontWeight: 700, marginBottom: 10, letterSpacing: 0.5, textTransform: "uppercase" }}>
              Review Incorrect
            </p>
            {answers.filter(a => !a.isCorrect).map((a, i) => {
              const orig = quiz.find(qq => qq.q === a.question);
              return (
                <div key={i} style={{ background: C.card, borderRadius: 12, padding: 14, marginBottom: 10, borderLeft: `3px solid ${C.red}` }}>
                  <p style={{ color: C.text, fontSize: 13, fontWeight: 600, marginBottom: 6, lineHeight: 1.4 }}>{a.question}</p>
                  <p style={{ color: C.red, fontSize: 12 }}>✗ {orig?.options[a.selected]}</p>
                  <p style={{ color: C.emerald, fontSize: 12, marginTop: 2 }}>✓ {orig?.options[a.correct]}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 18px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button onClick={onBack} style={ghostBtnStyle()}>
          <ChevronLeft size={16} />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {streak >= 2 && (
            <span className="anim-pop-in" style={{ color: C.amber, fontSize: 13, fontWeight: 700 }}>
              🔥 {streak}
            </span>
          )}
          <span style={{ color: C.dim, fontSize: 13 }}>{current + 1}/{quiz.length}</span>
        </div>
      </div>

      {/* Progress track */}
      <div style={{ height: 3, background: C.border, borderRadius: 2, marginBottom: 28, overflow: "hidden" }}>
        <div style={{
          height: 3, background: `linear-gradient(90deg, ${color}, ${color}88)`,
          borderRadius: 2, width: `${((current) / quiz.length) * 100}%`,
          transition: "width 0.5s cubic-bezier(0.34,1.56,0.64,1)"
        }} />
      </div>

      {/* Question */}
      <div key={animKey} className="anim-slide-in-up">
        <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 24, lineHeight: 1.5, letterSpacing: -0.3 }}>
          {q.q}
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {q.options.map((opt, i) => {
            let bg = C.card, border = C.border2, col = "#B0BCDC", icon = null;
            if (showResult) {
              if (i === q.correct) { bg = "#052E16"; border = C.emerald; col = "#D1FAE5"; icon = <Check size={14} />; }
              else if (i === selected) { bg = "#450A0A"; border = C.red; col = "#FEE2E2"; icon = <X size={14} />; }
            } else if (i === selected) {
              bg = "#0A1F3F"; border = color; col = C.text;
            }
            return (
              <button key={i} onClick={() => handleSelect(i)}
                style={{
                  padding: "14px 16px", background: bg, border: `2px solid ${border}`,
                  borderRadius: 14, color: col, cursor: showResult ? "default" : "pointer",
                  fontSize: 14, textAlign: "left", display: "flex", alignItems: "center", gap: 12,
                  transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                  transform: "scale(1)",
                  fontFamily: "inherit",
                  animation: showResult && (i === q.correct || i === selected) ? (i === q.correct ? "fadeIn 0.3s ease" : "fadeIn 0.3s ease") : undefined,
                }}
                onMouseDown={e => { if (!showResult) e.currentTarget.style.transform = "scale(0.97)"; }}
                onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
                onTouchStart={e => { if (!showResult) e.currentTarget.style.transform = "scale(0.97)"; }}
                onTouchEnd={e => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                <span style={{
                  width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center",
                  justifyContent: "center", background: showResult && i === q.correct ? C.emerald
                    : showResult && i === selected ? C.red : C.bg,
                  fontSize: 12, fontWeight: 800, flexShrink: 0, color: showResult ? "#fff" : C.muted,
                  transition: "all 0.25s",
                }}>
                  {icon || String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className="anim-slide-in-up"
            style={{
              marginTop: 16, padding: 16,
              background: selected === q.correct ? "#041F10" : "#2D0808",
              borderRadius: 14,
              borderLeft: `3px solid ${selected === q.correct ? C.emerald : C.red}`,
              fontSize: 13, color: selected === q.correct ? "#A7F3D0" : "#FCA5A5", lineHeight: 1.65,
            }}>
            {selected === q.correct ? "✓ Correct! " : "✗ Not quite. "}
            {q.explanation}
          </div>
        )}
      </div>

      {showResult && (
        <button className="anim-slide-in-up" onClick={handleNext}
          style={{
            marginTop: 20, width: "100%", padding: 16,
            background: `linear-gradient(135deg, ${color}, ${color}BB)`,
            border: "none", borderRadius: 14, color: "#fff", fontSize: 16,
            fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
            boxShadow: `0 8px 24px ${color}44`,
            transition: "transform 0.15s, opacity 0.15s",
          }}
          onMouseDown={e => { e.currentTarget.style.transform = "scale(0.97)"; }}
          onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
          onTouchStart={e => { e.currentTarget.style.transform = "scale(0.97)"; }}
          onTouchEnd={e => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          {current < quiz.length - 1 ? "Next Question →" : "See Results 🏆"}
        </button>
      )}
    </div>
  );
}

// ─── CHAPTER VIEW ─────────────────────────────────────────────────────
function ChapterView({ chapter, onQuiz, onBack }) {
  const [openSection, setOpenSection] = useState(0);
  const Icon = ICON_MAP[chapter.icon] || BookOpen;

  return (
    <div className="anim-slide-in-right" style={{ padding: "20px 18px" }}>
      {/* Back */}
      <button onClick={onBack} style={{ ...ghostBtnStyle(), marginBottom: 20, display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: C.muted }}>
        <ChevronLeft size={16} /> Chapters
      </button>

      {/* Chapter header with photo */}
      <div style={{ marginBottom: 24, borderRadius: 18, overflow: "hidden", border: `1px solid ${chapter.color}33` }}>
        <div style={{
          height: 140, position: "relative",
          backgroundImage: `linear-gradient(180deg, rgba(6,8,15,0) 0%, rgba(6,8,15,0.88) 100%), url(${PHOTOS[chapter.id]})`,
          backgroundSize: "cover", backgroundPosition: "center 30%",
          backgroundColor: chapter.color + "22",
        }}>
          <div style={{ position: "absolute", bottom: 14, left: 16, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: "rgba(6,8,15,0.65)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${chapter.color}55`, flexShrink: 0 }}>
              <Icon size={22} color={chapter.color} />
            </div>
            <div>
              <h2 style={{ fontSize: 19, fontWeight: 800, color: C.text, margin: 0, letterSpacing: -0.5, textShadow: "0 1px 8px rgba(0,0,0,0.8)" }}>{chapter.title}</h2>
              <p style={{ color: C.muted, fontSize: 12, margin: 0, marginTop: 2 }}>
                {chapter.sections.length} sections{chapter.quiz ? ` · ${chapter.quiz.length} questions` : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sections */}
      {chapter.sections.map((sec, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <button
            onClick={() => setOpenSection(openSection === i ? -1 : i)}
            style={{
              width: "100%", padding: "15px 16px",
              background: openSection === i ? C.card : C.surface,
              border: `1px solid ${openSection === i ? chapter.color + "44" : C.border}`,
              borderRadius: openSection === i ? "14px 14px 0 0" : 14,
              color: C.text, cursor: "pointer", fontSize: 14, fontWeight: 600,
              textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center",
              transition: "all 0.2s", fontFamily: "inherit",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ color: chapter.color, fontSize: 12, fontWeight: 800, opacity: 0.8, minWidth: 22 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              {sec.title}
            </span>
            <ChevronRight size={15} style={{
              transform: openSection === i ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
              color: C.dim, flexShrink: 0,
            }} />
          </button>

          <div style={{
            overflow: "hidden",
            maxHeight: openSection === i ? "2000px" : "0",
            transition: "max-height 0.4s cubic-bezier(0.25,0.46,0.45,0.94)",
          }}>
            <div style={{
              padding: "16px 18px 20px",
              background: C.card,
              borderRadius: "0 0 14px 14px",
              border: `1px solid ${chapter.color}22`,
              borderTop: "none",
            }}>
              <ContentRenderer text={sec.content} />
            </div>
          </div>
        </div>
      ))}

      {/* Quiz CTA */}
      {chapter.quiz && (
        <button onClick={onQuiz}
          style={{
            marginTop: 24, width: "100%", padding: 18,
            background: `linear-gradient(135deg, ${chapter.color}28, ${chapter.color}12)`,
            border: `2px solid ${chapter.color}55`, borderRadius: 16,
            color: C.text, cursor: "pointer", fontSize: 15, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            fontFamily: "inherit",
            transition: "transform 0.15s, box-shadow 0.15s",
            boxShadow: `0 4px 20px ${chapter.color}22`,
          }}
          onMouseDown={e => { e.currentTarget.style.transform = "scale(0.97)"; }}
          onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
          onTouchStart={e => { e.currentTarget.style.transform = "scale(0.97)"; }}
          onTouchEnd={e => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          <Brain size={19} color={chapter.color} />
          Take the Quiz — {chapter.quiz.length} Questions
        </button>
      )}
      <div style={{ height: 24 }} />
    </div>
  );
}

// ─── FULL PRACTICE TEST ────────────────────────────────────────────────
function FullTestView({ onBack }) {
  const allQ = CHAPTERS.filter(c => c.quiz).flatMap(c => c.quiz.map(q => ({ ...q, chapter: c.title, color: c.color })));
  const [shuffled] = useState(() => [...allQ].sort(() => Math.random() - 0.5).slice(0, 25));
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (finished) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [finished]);

  const q = shuffled[current];
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  const handleSelect = (idx) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    if (idx === q.correct) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (current < shuffled.length - 1) {
      setCurrent(c => c + 1); setSelected(null); setShowResult(false); setAnimKey(k => k + 1);
    } else {
      setFinished(true);
    }
  };

  if (finished) {
    const pct = Math.round((score / shuffled.length) * 100);
    const passed = pct >= 80;
    return (
      <div className="anim-scale-in" style={{ padding: "32px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 56, animation: "heroFloat 3s ease-in-out infinite", marginBottom: 16 }}>
          {passed ? "🎓" : "📖"}
        </div>
        <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: -0.5, color: passed ? C.emerald : C.amber, marginBottom: 4 }}>
          {passed ? "Test Passed!" : "Keep Practicing!"}
        </h2>
        <p style={{ color: C.muted, fontSize: 14, marginBottom: 24 }}>
          {mins}m {secs}s · {shuffled.length} questions
        </p>
        <div style={{ marginBottom: 12 }}>
          <ProgressRing progress={pct} size={130} stroke={9} color={passed ? C.emerald : C.amber} />
        </div>
        <p style={{ fontSize: 24, fontWeight: 800, color: C.text, marginTop: 12 }}>{score} / {shuffled.length}</p>
        <p style={{ color: C.muted, fontSize: 13, maxWidth: 280, margin: "10px auto 28px", lineHeight: 1.6 }}>
          {passed ? "Outstanding! You're well prepared for the official written test." : "Review your weak chapters and try again. You need 80% to pass."}
        </p>
        <button onClick={onBack} style={{ ...btnStyle(C.border, C.border2, C.text, true), width: "100%", marginBottom: 10 }}>
          ← Back to Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button onClick={onBack} style={ghostBtnStyle()}><ChevronLeft size={16} /></button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Clock size={13} color={C.dim} />
          <span style={{ color: C.dim, fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
            {mins}:{String(secs).padStart(2, "0")}
          </span>
          <span style={{ color: C.dim, fontSize: 13, marginLeft: 4 }}>
            {current + 1}/{shuffled.length}
          </span>
        </div>
      </div>

      <div style={{ height: 3, background: C.border, borderRadius: 2, marginBottom: 6, overflow: "hidden" }}>
        <div style={{
          height: 3, background: `linear-gradient(90deg, ${C.violet}, ${C.sky})`,
          borderRadius: 2, width: `${(current / shuffled.length) * 100}%`,
          transition: "width 0.5s cubic-bezier(0.34,1.56,0.64,1)",
        }} />
      </div>
      <p style={{ color: C.dim, fontSize: 11, marginBottom: 24, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {q.chapter}
      </p>

      <div key={animKey} className="anim-slide-in-up">
        <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 22, lineHeight: 1.5, letterSpacing: -0.3 }}>
          {q.q}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {q.options.map((opt, i) => {
            let bg = C.card, border = C.border2, col = "#B0BCDC";
            if (showResult) {
              if (i === q.correct) { bg = "#052E16"; border = C.emerald; col = "#D1FAE5"; }
              else if (i === selected) { bg = "#450A0A"; border = C.red; col = "#FEE2E2"; }
            }
            return (
              <button key={i} onClick={() => handleSelect(i)}
                style={{
                  padding: "13px 15px", background: bg, border: `2px solid ${border}`,
                  borderRadius: 13, color: col, cursor: showResult ? "default" : "pointer",
                  fontSize: 14, textAlign: "left", display: "flex", alignItems: "center", gap: 10,
                  transition: "all 0.22s", fontFamily: "inherit",
                }}
                onMouseDown={e => { if (!showResult) e.currentTarget.style.transform = "scale(0.97)"; }}
                onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
                onTouchStart={e => { if (!showResult) e.currentTarget.style.transform = "scale(0.97)"; }}
                onTouchEnd={e => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                <span style={{
                  width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center",
                  justifyContent: "center", background: showResult && i === q.correct ? C.emerald
                    : showResult && i === selected ? C.red : C.bg,
                  fontSize: 11, fontWeight: 800, flexShrink: 0, color: showResult ? "#fff" : C.muted,
                }}>
                  {showResult && i === q.correct ? <Check size={12} /> : showResult && i === selected ? <X size={12} /> : String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
        {showResult && (
          <div className="anim-slide-in-up"
            style={{
              marginTop: 14, padding: 14,
              background: selected === q.correct ? "#041F10" : "#2D0808",
              borderRadius: 12, borderLeft: `3px solid ${selected === q.correct ? C.emerald : C.red}`,
              fontSize: 13, color: selected === q.correct ? "#A7F3D0" : "#FCA5A5", lineHeight: 1.6,
            }}>
            {selected === q.correct ? "✓ " : "✗ "}{q.explanation}
          </div>
        )}
      </div>

      {showResult && (
        <button className="anim-slide-in-up" onClick={handleNext}
          style={{
            marginTop: 18, width: "100%", padding: 16,
            background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
            border: "none", borderRadius: 14, color: "#fff", fontSize: 16,
            fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 8px 24px #7C3AED44",
          }}
          onMouseDown={e => { e.currentTarget.style.transform = "scale(0.97)"; }}
          onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
          onTouchStart={e => { e.currentTarget.style.transform = "scale(0.97)"; }}
          onTouchEnd={e => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          {current < shuffled.length - 1 ? "Next →" : "See Results"}
        </button>
      )}
    </div>
  );
}

// ─── PROGRESS VIEW ────────────────────────────────────────────────────
function ProgressView({ quizScores }) {
  const topics = CHAPTERS.filter(c => c.quiz);
  const totalQ = topics.reduce((s, c) => s + c.quiz.length, 0);
  const totalCorrect = Object.values(quizScores).reduce((s, v) => s + v, 0);
  const overallPct = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;

  const readiness = overallPct >= 90 ? { label: "Test Ready!", color: C.emerald, emoji: "🏆" }
    : overallPct >= 70 ? { label: "Almost There", color: C.amber, emoji: "📈" }
    : overallPct >= 40 ? { label: "Building Up", color: C.sky, emoji: "📚" }
    : { label: "Getting Started", color: C.muted, emoji: "🌱" };

  return (
    <div className="anim-slide-in-up" style={{ padding: "24px 18px" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4, letterSpacing: -0.5 }}>
        Your Progress
      </h2>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 28 }}>Track your readiness for the written test</p>

      {/* Overall ring + label */}
      <div style={{
        background: `linear-gradient(135deg, ${readiness.color}18, ${readiness.color}08)`,
        border: `1px solid ${readiness.color}30`,
        borderRadius: 20, padding: "28px 20px", display: "flex", alignItems: "center", gap: 20, marginBottom: 24,
      }}>
        <ProgressRing progress={overallPct} size={90} stroke={7} color={readiness.color} />
        <div>
          <p style={{ fontSize: 22, margin: 0 }}>{readiness.emoji}</p>
          <p style={{ fontSize: 18, fontWeight: 800, color: readiness.color, margin: "4px 0 2px", letterSpacing: -0.3 }}>
            {readiness.label}
          </p>
          <p style={{ color: C.muted, fontSize: 13, margin: 0 }}>
            {totalCorrect} of {totalQ} questions mastered
          </p>
        </div>
      </div>

      {/* Per-chapter bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {topics.map((ch, i) => {
          const best = quizScores[ch.id] || 0;
          const pct = Math.round((best / ch.quiz.length) * 100);
          const barColor = pct >= 80 ? C.emerald : pct >= 50 ? C.amber : C.border2;
          const Icon = ICON_MAP[ch.icon] || BookOpen;
          return (
            <div key={ch.id} className="anim-slide-in-left" data-stagger={Math.min(i, 5)}
              style={{ background: C.card, borderRadius: 14, padding: "13px 15px", border: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${ch.color}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={14} color={ch.color} />
                  </div>
                  <span style={{ color: C.text, fontSize: 13, fontWeight: 600 }}>{ch.title}</span>
                </div>
                <span style={{ color: barColor, fontSize: 12, fontWeight: 700 }}>
                  {best > 0 ? `${best}/${ch.quiz.length}` : "—"}
                  {pct >= 80 && " ✓"}
                </span>
              </div>
              <div style={{ height: 5, background: C.bg, borderRadius: 3, overflow: "hidden" }}>
                <div style={{
                  height: 5, background: `linear-gradient(90deg, ${barColor}, ${barColor}88)`,
                  borderRadius: 3, width: `${pct}%`,
                  transition: "width 0.8s cubic-bezier(0.34,1.56,0.64,1)",
                }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tips card */}
      <div style={{ marginTop: 24, background: C.card, borderRadius: 16, padding: 18, border: `1px solid ${C.border}` }}>
        <p style={{ color: C.text, fontSize: 14, fontWeight: 700, marginBottom: 10 }}>💡 Study Tips</p>
        {[
          ["Study each chapter thoroughly", "before taking the quiz"],
          ["Aim for 80%+", "on every chapter quiz to mark it passed"],
          ["Re-take quizzes", "to reinforce weak areas"],
          ["Practice S.E.E.", "(Search, Evaluate, Execute) mentally as you observe traffic"],
        ].map(([b, r], i) => (
          <p key={i} style={{ color: C.muted, fontSize: 13, lineHeight: 1.6, marginBottom: 4 }}>
            • <strong style={{ color: C.text }}>{b}</strong> {r}
          </p>
        ))}
      </div>
      <div style={{ height: 24 }} />
    </div>
  );
}

// ─── HOME VIEW ────────────────────────────────────────────────────────
function HomeView({ onOpenChapter, onStartTest, onProgress, quizScores }) {
  const totalQuizChapters = CHAPTERS.filter(c => c.quiz).length;
  const passedChapters = CHAPTERS.filter(
    c => c.quiz && quizScores[c.id] && Math.round((quizScores[c.id] / c.quiz.length) * 100) >= 80
  ).length;
  const totalQ = CHAPTERS.filter(c => c.quiz).reduce((s, c) => s + c.quiz.length, 0);
  const totalCorrect = Object.values(quizScores).reduce((s, v) => s + v, 0);
  const overallPct = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;

  return (
    <div className="anim-fade-in" style={{ padding: "20px 18px" }}>
      {/* Hero */}
      <div style={{
        backgroundColor: "#0a1422",
        borderRadius: 22, padding: "28px 22px 24px", marginBottom: 22,
        position: "relative", overflow: "hidden",
      }}>
        {/* Gold accent line */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${C.gold}99, transparent)` }} />

        <div style={{ position: "relative" }}>
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
            <img src="/cimra-logo.jpg" alt="CIMRA" style={{ width: 130, height: 130, objectFit: "contain", animation: "heroFloat 4s ease-in-out infinite", filter: "drop-shadow(0 4px 18px rgba(0,0,0,0.8))", borderRadius: 12 }} />
          </div>
          <h1 style={{ fontSize: 23, fontWeight: 800, color: C.text, margin: "0 0 4px", letterSpacing: -0.6, lineHeight: 1.2, textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>
            Cayman Islands<br/>Motorcycle Rider Handbook
          </h1>
          <p style={{ color: C.gold, fontSize: 12, margin: "0 0 20px", lineHeight: 1.5, fontWeight: 600, letterSpacing: 0.5 }}>
            Cayman Custom Cycles × CIMRA
          </p>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 0, background: C.bg, borderRadius: 14, overflow: "hidden", border: `1px solid ${C.border}` }}>
            {[
              { n: CHAPTERS.length, l: "Chapters", c: C.sky },
              { n: totalQ, l: "Questions", c: C.violet },
              { n: `${passedChapters}/${totalQuizChapters}`, l: "Passed", c: C.emerald },
            ].map((s, i) => (
              <div key={i} style={{ flex: 1, padding: "12px 0", textAlign: "center", borderRight: i < 2 ? `1px solid ${C.border}` : "none" }}>
                <p style={{ fontSize: 20, fontWeight: 800, color: s.c, margin: 0 }}>{s.n}</p>
                <p style={{ fontSize: 11, color: C.dim, margin: 0, marginTop: 2 }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress pill */}
      {overallPct > 0 && (
        <div className="anim-slide-in-up"
          style={{ background: C.card, borderRadius: 14, padding: "13px 16px", marginBottom: 18, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 12 }}>
          <ProgressRing progress={overallPct} size={44} stroke={4} color={overallPct >= 80 ? C.emerald : C.amber} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.text, margin: 0 }}>Overall Readiness</p>
            <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>Keep going — aim for 80%+</p>
          </div>
          <button onClick={onProgress} style={{ marginLeft: "auto", ...ghostBtnStyle(), fontSize: 12, color: C.sky }}>
            Details →
          </button>
        </div>
      )}

      {/* Chapter grid */}
      <p style={{ color: C.dim, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, fontWeight: 700 }}>
        Chapters
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {CHAPTERS.map((ch, i) => {
          const Icon = ICON_MAP[ch.icon] || BookOpen;
          const hasPassed = ch.quiz && quizScores[ch.id] && Math.round((quizScores[ch.id] / ch.quiz.length) * 100) >= 80;
          return (
            <button key={ch.id} onClick={() => onOpenChapter(i)}
              className="anim-fade-in"
              data-stagger={Math.min(i % 6, 5)}
              style={{
                padding: 0, background: C.card, overflow: "hidden",
                border: `1px solid ${hasPassed ? C.emerald + "55" : C.border}`,
                borderRadius: 16, cursor: "pointer", textAlign: "left",
                display: "flex", flexDirection: "column",
                transition: "transform 0.15s, box-shadow 0.15s",
                fontFamily: "inherit",
                boxShadow: hasPassed ? `0 4px 20px ${C.emerald}18` : "none",
              }}
              onMouseDown={e => { e.currentTarget.style.transform = "scale(0.96)"; }}
              onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
              onTouchStart={e => { e.currentTarget.style.transform = "scale(0.96)"; }}
              onTouchEnd={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              {/* Photo thumbnail */}
              <div style={{
                height: 88, width: "100%",
                backgroundImage: `linear-gradient(180deg, rgba(6,8,15,0) 0%, rgba(6,8,15,0.78) 100%), url(${PHOTOS[ch.id]})`,
                backgroundSize: "cover", backgroundPosition: "center 30%",
                backgroundColor: ch.color + "22",
                display: "flex", alignItems: "flex-end", justifyContent: "space-between",
                padding: "0 10px 8px",
              }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(6,8,15,0.65)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${ch.color}55` }}>
                  <Icon size={14} color={ch.color} />
                </div>
                {hasPassed && <CheckCircle size={14} color={C.emerald} />}
              </div>
              {/* Text */}
              <div style={{ padding: "10px 11px 12px" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: C.text, margin: "0 0 2px", lineHeight: 1.3 }}>{ch.title}</p>
                <p style={{ fontSize: 11, color: C.dim, margin: 0 }}>
                  {ch.sections.length} sections{ch.quiz ? ` · ${ch.quiz.length}q` : ""}
                </p>
                {ch.quiz && quizScores[ch.id] > 0 && (
                  <div style={{ marginTop: 6, height: 3, background: C.bg, borderRadius: 2 }}>
                    <div style={{
                      height: 3, borderRadius: 2,
                      background: hasPassed ? C.emerald : C.amber,
                      width: `${(quizScores[ch.id] / ch.quiz.length) * 100}%`,
                    }} />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Full test CTA */}
      <button onClick={onStartTest}
        style={{
          width: "100%", padding: "18px 20px",
          background: "linear-gradient(135deg, #4C1D95, #2D1B69)",
          border: `1px solid #7C3AED55`, borderRadius: 18,
          color: "#fff", cursor: "pointer", fontFamily: "inherit",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 8px 32px #7C3AED33",
          transition: "transform 0.15s",
        }}
        onMouseDown={e => { e.currentTarget.style.transform = "scale(0.98)"; }}
        onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
        onTouchStart={e => { e.currentTarget.style.transform = "scale(0.98)"; }}
        onTouchEnd={e => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        <div style={{ textAlign: "left" }}>
          <p style={{ fontSize: 16, fontWeight: 800, margin: 0, letterSpacing: -0.3 }}>Full Practice Test</p>
          <p style={{ fontSize: 12, color: "#C4B5FD", margin: 0, marginTop: 2 }}>25 random questions · all chapters</p>
        </div>
        <Award size={28} color="#A78BFA" />
      </button>

      <p style={{ color: C.border2, fontSize: 11, textAlign: "center", marginTop: 24, lineHeight: 1.5 }}>
        Cayman Custom Cycles × CIMRA<br/>Grand Cayman
      </p>
      <div style={{ height: 16 }} />
    </div>
  );
}

// ─── CHAPTERS LIST ────────────────────────────────────────────────────
function ChaptersListView({ onOpenChapter, quizScores }) {
  return (
    <div className="anim-slide-in-up" style={{ padding: "24px 18px" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4, letterSpacing: -0.5 }}>Chapters</h2>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 22 }}>Study all {CHAPTERS.length} chapters to prepare for your test</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {CHAPTERS.map((ch, i) => {
          const Icon = ICON_MAP[ch.icon] || BookOpen;
          const hasPassed = ch.quiz && quizScores[ch.id] && Math.round((quizScores[ch.id] / ch.quiz.length) * 100) >= 80;
          const pct = ch.quiz && quizScores[ch.id] ? Math.round((quizScores[ch.id] / ch.quiz.length) * 100) : 0;
          return (
            <button key={ch.id} onClick={() => onOpenChapter(i)}
              className="anim-slide-in-left"
              data-stagger={Math.min(i % 6, 5)}
              style={{
                padding: "14px 15px", background: C.card,
                border: `1px solid ${hasPassed ? C.emerald + "44" : C.border}`,
                borderRadius: 15, cursor: "pointer", textAlign: "left",
                display: "flex", alignItems: "center", gap: 13,
                fontFamily: "inherit", transition: "transform 0.15s",
              }}
              onMouseDown={e => { e.currentTarget.style.transform = "scale(0.98)"; }}
              onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
              onTouchStart={e => { e.currentTarget.style.transform = "scale(0.98)"; }}
              onTouchEnd={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              <div style={{ width: 58, height: 50, borderRadius: 10, flexShrink: 0, overflow: "hidden", position: "relative",
                backgroundImage: `url(${PHOTOS[ch.id]})`,
                backgroundSize: "cover", backgroundPosition: "center",
                backgroundColor: ch.color + "22",
              }}>
                <div style={{ position: "absolute", inset: 0, background: "rgba(6,8,15,0.38)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} color={ch.color} />
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.text, margin: 0 }}>{ch.title}</p>
                  {hasPassed && <CheckCircle size={15} color={C.emerald} style={{ flexShrink: 0 }} />}
                </div>
                <p style={{ fontSize: 12, color: C.dim, margin: "3px 0 0" }}>
                  {ch.sections.length} sections{ch.quiz ? ` · ${ch.quiz.length} questions` : ""}
                </p>
                {ch.quiz && pct > 0 && (
                  <div style={{ marginTop: 6, height: 3, background: C.bg, borderRadius: 2 }}>
                    <div style={{ height: 3, borderRadius: 2, width: `${pct}%`, background: hasPassed ? C.emerald : C.amber }} />
                  </div>
                )}
              </div>
              <ChevronRight size={15} color={C.dim} style={{ flexShrink: 0 }} />
            </button>
          );
        })}
      </div>
      <div style={{ height: 24 }} />
    </div>
  );
}

// ─── QR VIEW ──────────────────────────────────────────────────────────
function QRView() {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    setUrl(getShareUrl());

    const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    setIsStandalone(Boolean(standalone));

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIos(/iphone|ipad|ipod/.test(ua));

    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const onInstalled = () => {
      setDeferredPrompt(null);
      setIsStandalone(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const handleCopy = () => {
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return (
    <div className="anim-slide-in-up" style={{ padding: "32px 20px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <div style={{ fontSize: 36, marginBottom: 10, animation: "heroFloat 4s ease-in-out infinite" }}>📱</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4, letterSpacing: -0.5 }}>Scan to Open on Mobile</h2>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 28, lineHeight: 1.6, maxWidth: 260 }}>
        Scan this QR code with your phone to open the handbook on any device on the same Wi-Fi network.
      </p>

      {url ? (
        <>
          {/* QR Card */}
          <div style={{
            background: "#ffffff", borderRadius: 24, padding: 20,
            boxShadow: "0 0 0 1px #ffffff22, 0 20px 60px #000000AA",
            marginBottom: 24, display: "inline-block",
          }}>
            <QRCodeSVG
              value={url}
              size={200}
              bgColor="#ffffff"
              fgColor="#070D1A"
              level="M"
              includeMargin={true}
            />
          </div>

          {/* URL pill */}
          <div style={{
            background: C.card, border: `1px solid ${C.border2}`,
            borderRadius: 12, padding: "10px 16px",
            display: "flex", alignItems: "center", gap: 10,
            marginBottom: 12, maxWidth: 320, width: "100%",
          }}>
            <span style={{ color: C.sky, fontSize: 13, fontFamily: "monospace", flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {url}
            </span>
            <button onClick={handleCopy}
              style={{
                background: copied ? C.emerald : C.border2,
                border: "none", borderRadius: 8,
                padding: "5px 10px", color: "#fff",
                cursor: "pointer", fontSize: 12, fontWeight: 700,
                fontFamily: "inherit", transition: "background 0.2s",
                flexShrink: 0,
              }}>
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
        </>
      ) : (
        <div style={{ width: 240, background: C.card, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", color: C.muted, marginBottom: 24, padding: "18px 16px", textAlign: "center", lineHeight: 1.5, border: `1px solid ${C.border}` }}>
          Network link not detected. Open this app using the Network URL shown in your terminal, then refresh this page.
        </div>
      )}

      {!isStandalone && (
        <div style={{ background: C.card, borderRadius: 16, padding: 18, width: "100%", maxWidth: 320, border: `1px solid ${C.border}`, textAlign: "left", marginBottom: 18 }}>
          <p style={{ color: C.text, fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Install App</p>
          {deferredPrompt ? (
            <>
              <p style={{ color: C.muted, fontSize: 12, marginBottom: 12, lineHeight: 1.5 }}>
                Install this handbook to your home screen so it opens like a standalone app.
              </p>
              <button onClick={handleInstall}
                style={{
                  width: "100%", border: "none", cursor: "pointer",
                  padding: "12px 0", borderRadius: 10,
                  background: `linear-gradient(135deg, ${C.sky}, ${C.violet})`,
                  color: "#fff", fontWeight: 800, fontSize: 14, fontFamily: "inherit",
                }}>
                Install to Home Screen
              </button>
            </>
          ) : (
            <p style={{ color: C.muted, fontSize: 12, margin: 0, lineHeight: 1.5 }}>
              {isIos
                ? "On iPhone/iPad: open in Safari, tap Share, then Add to Home Screen."
                : "Use your browser menu and choose Install App or Add to Home Screen."}
            </p>
          )}
        </div>
      )}

      {/* Instructions */}
      <div style={{ background: C.card, borderRadius: 16, padding: 18, width: "100%", maxWidth: 320, border: `1px solid ${C.border}`, textAlign: "left" }}>
        <p style={{ color: C.text, fontSize: 14, fontWeight: 700, marginBottom: 10 }}>How to use offline</p>
        {[
          ["1", "Open this Scan page while online"],
          ["2", "Tap Download for Offline Use"],
          ["3", "Open the downloaded handbook file on your device"],
          ["4", "Save/Add it to Home Screen for quick access without internet"],
        ].map(([n, t]) => (
          <div key={n} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: `${C.sky}22`, color: C.sky, fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{n}</span>
            <p style={{ color: C.muted, fontSize: 13, margin: 0, lineHeight: 1.5 }}>{t}</p>
          </div>
        ))}
      </div>

      <p style={{ color: C.border2, fontSize: 11, marginTop: 24, lineHeight: 1.5 }}>
        Install from this Scan page to use the handbook like a standalone app.
      </p>
      <div style={{ height: 24 }} />
    </div>
  );
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────
function BottomNav({ activeTab, onChange }) {
  const tabs = [
    { id: "home",     Icon: Home,       label: "Home" },
    { id: "chapters", Icon: BookOpen,   label: "Study" },
    { id: "test",     Icon: Award,      label: "Test" },
    { id: "progress", Icon: TrendingUp, label: "Progress" },
    { id: "scan",     Icon: QrCode,     label: "Scan" },
  ];
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 430,
      background: "#070D1ADD", backdropFilter: "blur(20px)",
      borderTop: `1px solid ${C.border}`,
      display: "flex", padding: "8px 0 calc(8px + env(safe-area-inset-bottom, 0px))",
      zIndex: 100,
    }}>
      {tabs.map(({ id, Icon: Ic, label }) => {
        const active = activeTab === id;
        return (
          <button key={id} onClick={() => onChange(id)}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              gap: 3, background: "none", border: "none", cursor: "pointer",
              padding: "4px 0", fontFamily: "inherit",
              transition: "opacity 0.15s", position: "relative",
            }}>
            {active && (
              <div style={{
                position: "absolute", top: -1, left: "22%", right: "22%",
                height: 2, borderRadius: 1,
                background: `linear-gradient(90deg, transparent, ${C.gold}, transparent)`,
              }} />
            )}
            <div style={{
              width: 32, height: 32, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
              background: active ? `${C.gold}18` : "transparent",
              transition: "background 0.2s, transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
              transform: active ? "scale(1.1)" : "scale(1)",
            }}>
              <Ic size={18} color={active ? C.gold : C.dim} strokeWidth={active ? 2.5 : 2} />
            </div>
            <span style={{ fontSize: 10, color: active ? C.gold : C.dim, fontWeight: active ? 700 : 400, letterSpacing: 0.2 }}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

// ─── BUTTON HELPERS ───────────────────────────────────────────────────
function btnStyle(bg, border, color, outline = false) {
  return {
    flex: 1, padding: "13px 16px",
    background: outline ? "transparent" : bg,
    border: `1.5px solid ${border}`,
    borderRadius: 12, color,
    cursor: "pointer", fontSize: 14, fontWeight: 700,
    fontFamily: "inherit", transition: "transform 0.15s",
    display: "flex", alignItems: "center", justifyContent: "center",
  };
}
function ghostBtnStyle() {
  return {
    background: "none", border: "none", color: C.muted,
    cursor: "pointer", padding: 6, borderRadius: 8,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "inherit",
  };
}

// ─── ROOT APP ─────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("home");        // home | chapters | test | progress
  const [chapterIdx, setChapterIdx] = useState(null);
  const [inQuiz, setInQuiz] = useState(false);
  const [quizScores, setQuizScores] = useState({});
  const prevTab = useRef("home");

  const handleTabChange = (t) => {
    if (t !== tab) { prevTab.current = tab; setTab(t); setChapterIdx(null); setInQuiz(false); }
  };

  const handleOpenChapter = (i) => {
    setChapterIdx(i);
    setInQuiz(false);
    // switch to chapters tab context if from home
    if (tab === "home") setTab("chapters");
  };

  const handleQuizComplete = (chId, score) => {
    setQuizScores(prev => ({ ...prev, [chId]: Math.max(prev[chId] || 0, score) }));
  };

  const chapter = chapterIdx !== null ? CHAPTERS[chapterIdx] : null;

  // Determine which main content panel to show
  const showChapterDetail = tab === "chapters" && chapter && !inQuiz;
  const showQuiz = tab === "chapters" && chapter && inQuiz;
  const showTest = tab === "test";
  const showProgress = tab === "progress";
  const showScan = tab === "scan";
  const showChaptersList = tab === "chapters" && !chapter;
  const showHome = tab === "home" && !chapter;

  return (
    <div style={{
      background: C.bg, minHeight: "100dvh", maxWidth: 430,
      margin: "0 auto", position: "relative", overflowX: "hidden",
    }}>
      {/* Status bar spacer */}
      <div style={{ height: "env(safe-area-inset-top, 0px)" }} />

      {/* Header */}
      <header style={{
        background: `${C.bg}EE`, backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${C.border}`,
        padding: "14px 18px 13px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 50, flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {(showChapterDetail || showQuiz) ? (
            <button onClick={() => { if (showQuiz) { setInQuiz(false); } else { setChapterIdx(null); } }}
              style={{ ...ghostBtnStyle(), marginRight: 2 }}>
              <ChevronLeft size={20} />
            </button>
          ) : null}
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: `linear-gradient(135deg, ${C.gold}, #8B6A20)`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Bike size={18} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: C.text, margin: 0, letterSpacing: -0.3, lineHeight: 1 }}>
              {showChapterDetail ? chapter.title
                : showQuiz ? `Quiz`
                : showTest ? "Practice Test"
                : showProgress ? "My Progress"
                : showScan ? "Scan QR Code"
                : showChaptersList ? "All Chapters"
                : "Cayman Custom Cycles"}
            </p>
            <p style={{ fontSize: 10, color: C.dim, margin: 0 }}>
              {showChapterDetail ? `${chapter.sections.length} sections` :
               showQuiz ? chapter.title :
               showScan ? "Open on your phone" :
               "Motorcycle Handbook"}
            </p>
          </div>
        </div>

        {/* Chapter nav arrows */}
        {showChapterDetail && (
          <div style={{ display: "flex", gap: 6 }}>
            {chapterIdx > 0 && (
              <button onClick={() => { setChapterIdx(chapterIdx - 1); setInQuiz(false); }}
                style={{ ...ghostBtnStyle(), background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "5px 8px" }}>
                <ChevronLeft size={15} />
              </button>
            )}
            {chapterIdx < CHAPTERS.length - 1 && (
              <button onClick={() => { setChapterIdx(chapterIdx + 1); setInQuiz(false); }}
                style={{ ...ghostBtnStyle(), background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, padding: "5px 8px" }}>
                <ChevronRight size={15} />
              </button>
            )}
          </div>
        )}
      </header>

      {/* Scrollable content */}
      <main style={{
        overflowY: "auto",
        paddingBottom: "calc(72px + env(safe-area-inset-bottom, 0px))",
        minHeight: "calc(100dvh - 62px)",
      }}>
        {showHome && (
          <HomeView
            quizScores={quizScores}
            onOpenChapter={handleOpenChapter}
            onStartTest={() => handleTabChange("test")}
            onProgress={() => handleTabChange("progress")}
          />
        )}
        {showChaptersList && (
          <ChaptersListView quizScores={quizScores} onOpenChapter={handleOpenChapter} />
        )}
        {showChapterDetail && (
          <ChapterView
            key={`ch-${chapterIdx}`}
            chapter={chapter}
            onQuiz={() => setInQuiz(true)}
            onBack={() => setChapterIdx(null)}
          />
        )}
        {showQuiz && (
          <QuizView
            key={`quiz-${chapterIdx}`}
            quiz={chapter.quiz}
            chapterTitle={chapter.title}
            chapterColor={chapter.color}
            onBack={() => setInQuiz(false)}
            onComplete={(score) => handleQuizComplete(chapter.id, score)}
          />
        )}
        {showTest && (
          <FullTestView key="fulltest" onBack={() => handleTabChange("home")} />
        )}
        {showProgress && (
          <ProgressView quizScores={quizScores} />
        )}
        {showScan && (
          <QRView />
        )}
      </main>

      {/* Bottom Nav */}
      <BottomNav activeTab={tab} onChange={handleTabChange} />
    </div>
  );
}
