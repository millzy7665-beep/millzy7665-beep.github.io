import { useState, useEffect, useRef } from "react";
import {
  BookOpen, Shield, AlertTriangle, ChevronRight, ChevronLeft,
  Award, Brain, Eye, Gauge, Heart, Target, MapPin, Settings,
  FileText, RotateCcw, Star, TrendingUp, Check, X, Clock,
  Bike, Home, CheckCircle, Zap, Menu, Info, QrCode,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import "./animations.css";
import { subscribeToLiveHandbook } from "./liveHandbook";

// Network IP injected by Vite define at build/serve time
/* global __APP_VERSION__, __LOCAL_IP__, __SECURE_SHARE_URL__ */
const APP_VERSION = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev";
const NETWORK_IP = typeof __LOCAL_IP__ !== "undefined" ? __LOCAL_IP__ : null;
const SECURE_SHARE_URL = typeof __SECURE_SHARE_URL__ !== "undefined" ? __SECURE_SHARE_URL__ : null;
const LOGO_SRC = `/cimra-logo.jpg?v=${APP_VERSION}`;

// ─── PALETTE ──────────────────────────────────────────────────────────
const C = {
  bg:       "#0F0E0C",
  surface:  "#161412",
  card:     "#1D1A17",
  border:   "#302A24",
  border2:  "#443C34",
  text:     "#F3EEE6",
  muted:    "#B8AC99",
  dim:      "#7B7063",
  gold:     "#AF8B52",
  goldL:    "#D1B17A",
  sky:      "#908578",
  violet:   "#756B61",
  emerald:  "#75806F",
  amber:    "#9E7A49",
  rose:     "#89685E",
  red:      "#916558",
};

const TITLE_FONT = '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif';

// ─── PHOTOS ───────────────────────────────────────────────────────────
const _P = (id, w, h) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=80`;
const PHOTOS = {
  hero:             _P("1558980394-4c7c9299fe96", 900, 480),
  welcome:          _P("1558981033-0f0309284409", 400, 200),
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

function getShareUrl(path = "") {
  if (typeof window === "undefined") return "";

  let baseUrl = "";

  // A secure URL is required for reliable mobile app installation.
  if (SECURE_SHARE_URL && SECURE_SHARE_URL.startsWith("https://")) {
    baseUrl = SECURE_SHARE_URL;
  } else {
    const origin = window.location.origin;
    const originIsSecure = window.location.protocol === "https:";

    if (originIsSecure) {
      baseUrl = origin;
    } else {
      const port = window.location.port || "5173";
      const host = window.location.hostname;
      const isLocalHost = host === "localhost" || host === "127.0.0.1";
      const networkHost = NETWORK_IP || (!isLocalHost ? host : "");
      if (!networkHost) return "";
      baseUrl = `http://${networkHost}:${port}`;
    }
  }

  if (!path) return baseUrl;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl.replace(/\/$/, "")}${normalizedPath}`;
}

function createNavigationState(showWelcome, tab, chapterIdx, inQuiz) {
  return {
    showWelcome,
    tab,
    chapterIdx,
    inQuiz,
  };
}

function normalizeNavigationState(state) {
  if (!state || typeof state !== "object") return null;

  const normalizedTab = typeof state.tab === "string" ? state.tab : "home";
  const normalizedChapterIdx = Number.isInteger(state.chapterIdx) ? state.chapterIdx : null;

  return {
    showWelcome: Boolean(state.showWelcome),
    tab: normalizedTab,
    chapterIdx: normalizedChapterIdx,
    inQuiz: Boolean(state.inQuiz),
  };
}

function navigationStatesMatch(left, right) {
  return left?.showWelcome === right?.showWelcome
    && left?.tab === right?.tab
    && left?.chapterIdx === right?.chapterIdx
    && left?.inQuiz === right?.inQuiz;
}

// ─── DATA ─────────────────────────────────────────────────────────────
const CHAPTERS = [
  {
    id: "licensing", title: "Licensing & Registration", icon: "FileText", color: "#8D806E",
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
        {
          q: "What are the requirements for obtaining a motorcycle learner license?",
          options: ["Group 0 (Mopeds), Group 1 (Motorcycles including mopeds and motor scooters up to 125cc), and Group 1A (Motorcycles in excess of 125cc).", "You must be at least 17 years old, and you MUST pass a theory test before obtaining a motorcycle learner license, and then a practical test.", "A learner license holder must not carry a pillion (passenger), must display 'L' plates while riding, and must ride within the restrictions of a learner license.", "Hold a full Group 1 license and successfully complete a basic rider safety course approved by the Director, OR hold a full Group 1 driver's license to drive motor cars, trucks or special vehicles and wish to obtain a motorcycle license (requires a practical test for Group 1 only), OR may provide documentation of a motorcycle operator's license issued by another recognized jurisdiction."],
          correct: 1,
          explanation: "The handbook specifies the minimum age of 17 and that both a theory test and practical test are required to obtain a full motorcycle license."
        },
        {
          q: "What requirements apply to persons operating a motorcycle with a learner's permit?",
          options: ["A learner license holder must not carry a pillion (passenger), must display 'L' plates while riding, and must ride within the restrictions of a learner license.", "You must be at least 17 years old, and you MUST pass a theory test before obtaining a motorcycle learner license, and then a practical test.", "Group 0 (Mopeds), Group 1 (Motorcycles including mopeds and motor scooters up to 125cc), and Group 1A (Motorcycles in excess of 125cc).", "Hold a full Group 1 license and successfully complete a basic rider safety course approved by the Director, OR hold a full Group 1 driver's license to drive motor cars, trucks or special vehicles and wish to obtain a motorcycle license (requires a practical test for Group 1 only), OR may provide documentation of a motorcycle operator's license issued by another recognized jurisdiction."],
          correct: 0,
          explanation: "Learner riders have specific restrictions to ensure they develop skills safely before carrying passengers or riding without supervision."
        },
        {
          q: "What three license groups apply to operation of motorcycles?",
          options: ["Group 0 (Mopeds), Group 1 (Motorcycles including mopeds and motor scooters up to 125cc), and Group 1A (Motorcycles in excess of 125cc).", "You must be at least 17 years old, and you MUST pass a theory test before obtaining a motorcycle learner license, and then a practical test.", "Hold a full Group 1 license and successfully complete a basic rider safety course approved by the Director, OR hold a full Group 1 driver's license to drive motor cars, trucks or special vehicles and wish to obtain a motorcycle license (requires a practical test for Group 1 only), OR may provide documentation of a motorcycle operator's license issued by another recognized jurisdiction.", "A learner license holder must not carry a pillion (passenger), must display 'L' plates while riding, and must ride within the restrictions of a learner license."],
          correct: 0,
          explanation: "The Cayman Islands Motor Vehicle Operator's Licenses are issued in groups: 0 for mopeds, 1 for motorcycles up to 125cc, and 1A for motorcycles over 125cc."
        },
        {
          q: "To qualify for a motorcycle operator's license for an engine displacement greater than 125cc, you must meet one of the following criteria:",
          options: ["Hold a full Group 1 license and successfully complete a basic rider safety course approved by the Director, OR hold a full Group 1 driver's license to drive motor cars, trucks or special vehicles and wish to obtain a motorcycle license (requires a practical test for Group 1 only), OR may provide documentation of a motorcycle operator's license issued by another recognized jurisdiction.", "You must be at least 17 years old, and you MUST pass a theory test before obtaining a motorcycle learner license, and then a practical test.", "A learner license holder must not carry a pillion (passenger), must display 'L' plates while riding, and must ride within the restrictions of a learner license.", "Group 0 (Mopeds), Group 1 (Motorcycles including mopeds and motor scooters up to 125cc), and Group 1A (Motorcycles in excess of 125cc)."],
          correct: 0,
          explanation: "To progress to a larger displacement motorcycle (Group 1A), riders must demonstrate they already have basic riding competency through a Group 1 license and approved safety course, or equivalent foreign credentials."
        },

    ],
  },
  {
    id: "rules", title: "Rules of the Road", icon: "Shield", color: "#83554E",
    sections: [
      { title: "General Road Code",
        content: `In the Cayman Islands, any person operating a motorcycle is subject to the same regulations as any other motor vehicle driver. Drivers from all corners of the world live here where traffic laws can differ — always be alert.

**Key Rules:**
• Minimum age **17** to operate any motor vehicle
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
• A learner license holder may carry a pillion passenger if the passenger is fully licensed
• Full license holders may carry **no more than one passenger**, seated facing forward on foot rests
• A passenger should only be carried if the motorcycle is designed/manufactured for it
• Motorcycles may ride **two abreast** in a single lane but NOT more than two
• You shall NOT overtake and pass in the same lane as the vehicle being overtaken
• No person shall operate between lanes of traffic or between rows of vehicles
• **Keep both wheels on the ground at all times**` },
      { title: "Helmet & Equipment Requirements",
        content: `• Everyone MUST wear an approved motorcycle helmet (DOT or ECE)
• You should always wear eye protection: goggles, face shields, or eyeglasses
• Tinted devices shall not be used at night
• No headsets, headphones or listening devices that interfere with hearing
• Passenger motorcycles must have footrests and handholds
• Handlebars/handgrips must not be higher than the rider's shoulders
• Required lights: headlight, red rear light, red reflector, brake light, registration plate light, amber turn signals (front & rear)
• No red lights at the front; no white lights (other than reverse or plate light) at the rear` },
    ],
    quiz: [
        {
          q: "Why study the rules governing the operation of trucks and automobiles in the Cayman Islands if you are only driving a motorcycle?",
          options: ["A person propelling a moped solely by human power upon and along a sidewalk, or across a roadway upon and along a crosswalk, has all the rights and duties applicable to a pedestrian. No person shall propel a moped upon and along a sidewalk while the motor is operating.", "All traffic approaching a roundabout must yield to the traffic that is already in it. Be sure to slow or come to a complete stop as you approach the roundabout because all vehicles in the roundabout have the right of way. Cars in the right-hand lane have right of way.", "Because any person operating a motorcycle or moped is subject to the same regulations and carries the same responsibilities as a driver of any other motor vehicle on the public right of way. You must share the road with all other vehicles and understand their rules.", "No person shall operate any motorcycle with handlebars or with handgrips that are higher than the top of the shoulders of the person operating the motorcycle while properly seated upon the motorcycle."],
          correct: 2,
          explanation: "Motorcyclists are not exempt from general traffic laws. Understanding rules for all vehicles helps riders anticipate the behavior of other road users and interact safely with them."
        },
        {
          q: "Why is it not unexpected to encounter drivers operating or turning into the wrong lane of the road in the Cayman Islands?",
          options: ["The turning lane in the centre of some roads is designed to help drivers turn right across traffic. The lane should never be used for overtaking.", "No person shall operate any motorcycle with handlebars or with handgrips that are higher than the top of the shoulders of the person operating the motorcycle while properly seated upon the motorcycle.", "In the Cayman Islands there are drivers from all corners of the world where traffic laws can be quite different. Drivers may be accustomed to unusual driving practices and may make errors due to unfamiliar local traffic patterns.", "When a school bus has its lights flashing and has slowed down or stopped, drivers are NOT permitted to pass the bus from the front as well as those at the rear. Slow down and do not pass."],
          correct: 2,
          explanation: "The Cayman Islands is an international community with many tourists and expatriates. Riders must stay alert because some drivers may be unfamiliar with local traffic rules such as driving on the left."
        },
        {
          q: "What is the minimum age to be legally licensed to operate a motor vehicle on roads, streets or highways of Grand Cayman?",
          options: ["A motorcycle must have: (1) A headlight which may or may not dip to the left. (2) A red rear light, a red reflector, a stoplight (brake light), and a registration plate light at the rear. (3) Functional amber turn signals front and rear. (4) No red light at the front. (5) No white light other than a reverse light or registration plate light to the rear. (6) No amber light other than a turn signal or emergency light to the rear. Lights must be illuminated at night.", "16 years old.", "Give right of way to all other vehicles, comply with all signals and other lawful directions given by wardens, give prior warning of any intended manoeuvre by means of the proper indicators, and check for traffic.", "Because any person operating a motorcycle or moped is subject to the same regulations and carries the same responsibilities as a driver of any other motor vehicle on the public right of way. You must share the road with all other vehicles and understand their rules."],
          correct: 1,
          explanation: "The handbook states: 'You must be at least 16 years of age to legally operate or be licensed to operate any motor vehicle on roads, streets or highways of Grand Cayman.'"
        },
        {
          q: "When is it acceptable to drive on the right side of the road?",
          options: ["When a school bus has its lights flashing and has slowed down or stopped, drivers are NOT permitted to pass the bus from the front as well as those at the rear. Slow down and do not pass.", "No. All motorcycles are entitled to full use of a lane and no motor vehicle shall be driven in such a manner as to deprive any motorcycle of the full use of a lane.", "In Cayman you keep to the LEFT of the road except when travelling in a one-way street, overtaking, or when otherwise directed by a traffic sign, police signal, or other authorized persons.", "Yes. Motorcycles may be operated two abreast in a single lane, but shall not be operated more than two abreast in a single lane."],
          correct: 2,
          explanation: "Cayman drives on the left side of the road (like the UK). Driving on the right is only permitted in specific circumstances such as overtaking or one-way streets."
        },
        {
          q: "Before making a right-hand turn, you must:",
          options: ["Such a person shall yield the right-of-way to any pedestrian and shall give an audible signal before overtaking and passing a pedestrian.", "Give prior warning of any intended manoeuvre by means of hand or traffic indicator signals.", "Give right of way to all other vehicles, comply with all signals and other lawful directions given by wardens, give prior warning of any intended manoeuvre by means of the proper indicators, and check for traffic.", "A person propelling a moped solely by human power upon and along a sidewalk, or across a roadway upon and along a crosswalk, has all the rights and duties applicable to a pedestrian. No person shall propel a moped upon and along a sidewalk while the motor is operating."],
          correct: 2,
          explanation: "Right-hand turns require yielding to oncoming traffic and pedestrians. Signaling intention in advance allows others to react safely."
        },
        {
          q: "What is the general rule to follow regarding speed and distance from other vehicles while driving?",
          options: ["The rear light or lights, the front head light or lights, and the registration plate light as prescribed by the class of vehicle driven. Lights must be illuminated at night, though it is advisable to keep them on all the time for added visibility.", "Drive at a speed and in a manner that allows you to stop in an emergency without being involved in a collision. Keep a watch on the road behind and in front of the vehicle being driven. Maintain adequate space cushion from other vehicles.", "Such a person shall yield the right-of-way to any pedestrian and shall give an audible signal before overtaking and passing a pedestrian.", "A learner license holder must NOT carry a pillion. Full license holders may carry no more than one (1) passenger. That passenger should be seated facing forward with feet on the foot rests. A pillion passenger should only be carried if the motorcycle is designed/manufactured to do so."],
          correct: 1,
          explanation: "Safe following distances and appropriate speeds are fundamental to avoiding collisions, as they provide time and space to react to unexpected hazards."
        },
        {
          q: "Before changing lane or direction, or stopping, you are required to:",
          options: ["Give right of way to emergency vehicles and other vehicles used by law enforcement officials.", "A motorcycle must have: (1) A headlight which may or may not dip to the left. (2) A red rear light, a red reflector, a stoplight (brake light), and a registration plate light at the rear. (3) Functional amber turn signals front and rear. (4) No red light at the front. (5) No white light other than a reverse light or registration plate light to the rear. (6) No amber light other than a turn signal or emergency light to the rear. Lights must be illuminated at night.", "In the Cayman Islands there are drivers from all corners of the world where traffic laws can be quite different. Drivers may be accustomed to unusual driving practices and may make errors due to unfamiliar local traffic patterns.", "Give prior warning of any intended manoeuvre by means of hand or traffic indicator signals."],
          correct: 3,
          explanation: "Signaling before lane changes, turns, or stops gives other road users advance notice of your intentions, reducing the risk of collisions."
        },
        {
          q: "When an intersection is without a traffic sign or signal giving priority to a road, how should you proceed?",
          options: ["A moped or other vehicle operating at a speed significantly slower than the speed of existing traffic on the roadway should keep as close as practical to the left side of the roadway to allow traffic moving at a normal speed to more easily pass on the right.", "Four-way stops work on the basis of whoever gets to the four-way stop first proceeds first. Turning left on a red light after a full stop is allowed.", "Where an intersection or road junction is without a traffic sign or signal giving priority to a road, drive in a way so as to avoid the possibility of collision with any other road user, irrespective of the relative size or condition of the intersection or road junction.", "Such a person shall yield the right-of-way to any pedestrian and shall give an audible signal before overtaking and passing a pedestrian."],
          correct: 2,
          explanation: "At uncontrolled intersections, all drivers share responsibility for avoiding collisions. No one has automatic right of way; caution and cooperation are required."
        },
        {
          q: "When approached by emergency vehicles or other vehicles used by law enforcement, fire or emergency medical services, you should:",
          options: ["Give right of way to emergency vehicles and other vehicles used by law enforcement officials.", "The turning lane in the centre of some roads is designed to help drivers turn right across traffic. The lane should never be used for overtaking.", "A person propelling a moped solely by human power upon and along a sidewalk, or across a roadway upon and along a crosswalk, has all the rights and duties applicable to a pedestrian. No person shall propel a moped upon and along a sidewalk while the motor is operating.", "Roundabouts are a frequent occurrence in Cayman and have proven to be a great way to control traffic flow. They allow traffic to flow continuously (when used correctly) without the need for traffic lights."],
          correct: 0,
          explanation: "Emergency vehicles on active calls need clear passage to protect life and property. All other road users are legally required to yield and make way."
        },
        {
          q: "At night you must display what lights to operate a vehicle on the road?",
          options: ["It is never acceptable. You MUST NOT use a hand-held mobile phone, or similar device, while driving or when supervising a learner driver. The Law does allow the use of a hands-free device subject to certain conditions, but it is far safer not to stop first or use the voicemail facility.", "The rear light or lights, the front head light or lights, and the registration plate light as prescribed by the class of vehicle driven. Lights must be illuminated at night, though it is advisable to keep them on all the time for added visibility.", "Always travel around a roundabout in a clockwise direction. Never turn right into a roundabout or you will turn into oncoming, one-way traffic.", "All traffic approaching a roundabout must yield to the traffic that is already in it. Be sure to slow or come to a complete stop as you approach the roundabout because all vehicles in the roundabout have the right of way. Cars in the right-hand lane have right of way."],
          correct: 1,
          explanation: "Lights are legally required at night for both the rider's visibility and to make the motorcycle visible to other road users, significantly reducing crash risk."
        },
        {
          q: "When is turning left on a red light allowed?",
          options: ["The turning lane in the centre of some roads is designed to help drivers turn right across traffic. The lane should never be used for overtaking.", "Turning left on a red light after a full stop is allowed, unless a sign prohibits it. (Note: In Cayman, traffic drives on the left, so a left turn on red is analogous to a right turn on red in countries that drive on the right.) Four-way stops work on the basis of whoever gets to the four-way stop first proceeds first.", "Four-way stops work on the basis of whoever gets to the four-way stop first proceeds first. Turning left on a red light after a full stop is allowed.", "Roundabouts are a frequent occurrence in Cayman and have proven to be a great way to control traffic flow. They allow traffic to flow continuously (when used correctly) without the need for traffic lights."],
          correct: 1,
          explanation: "The Cayman road code allows left turns on red (equivalent to right on red in right-hand traffic countries) after coming to a full stop and yielding to pedestrians and cross traffic."
        },
        {
          q: "What is the precedence of right of way at a four-way stop?",
          options: ["Give right of way to emergency vehicles and other vehicles used by law enforcement officials.", "Because any person operating a motorcycle or moped is subject to the same regulations and carries the same responsibilities as a driver of any other motor vehicle on the public right of way. You must share the road with all other vehicles and understand their rules.", "Four-way stops work on the basis of whoever gets to the four-way stop first proceeds first. Turning left on a red light after a full stop is allowed.", "A learner license holder must NOT carry a pillion. Full license holders may carry no more than one (1) passenger. That passenger should be seated facing forward with feet on the foot rests. A pillion passenger should only be carried if the motorcycle is designed/manufactured to do so."],
          correct: 2,
          explanation: "At four-way stops, the first-arrived vehicle has priority. If vehicles arrive simultaneously, the vehicle on the right typically has precedence."
        },
        {
          q: "What is the purpose of the centre lane of some roads?",
          options: ["The operator of a motorcycle shall not overtake and pass in the same lane occupied by the vehicle being overtaken. No person shall operate a motorcycle between lanes of traffic or between adjacent lines or rows of vehicles.", "A moped or other vehicle operating at a speed significantly slower than the speed of existing traffic on the roadway should keep as close as practical to the left side of the roadway to allow traffic moving at a normal speed to more easily pass on the right.", "The turning lane in the centre of some roads is designed to help drivers turn right across traffic. The lane should never be used for overtaking.", "Roundabouts are a frequent occurrence in Cayman and have proven to be a great way to control traffic flow. They allow traffic to flow continuously (when used correctly) without the need for traffic lights."],
          correct: 2,
          explanation: "Centre turning lanes provide a dedicated space for vehicles to wait while yielding to oncoming traffic before completing a right turn, reducing rear-end collisions."
        },
        {
          q: "What should you do when approaching a school bus that has its lights flashing and has slowed down or has stopped to allow children to get on or off?",
          options: ["Where an intersection or road junction is without a traffic sign or signal giving priority to a road, drive in a way so as to avoid the possibility of collision with any other road user, irrespective of the relative size or condition of the intersection or road junction.", "When a school bus has its lights flashing and has slowed down or stopped, drivers are NOT permitted to pass the bus from the front as well as those at the rear. Slow down and do not pass.", "Because any person operating a motorcycle or moped is subject to the same regulations and carries the same responsibilities as a driver of any other motor vehicle on the public right of way. You must share the road with all other vehicles and understand their rules.", "You can always go around the roundabout again to avoid a confrontation. Be courteous to other drivers and give them lots of space."],
          correct: 1,
          explanation: "Children boarding or exiting school buses may cross the road unexpectedly. Passing a stopped school bus is extremely dangerous and illegal."
        },
        {
          q: "What is the speed limit set in dedicated school zones?",
          options: ["All traffic approaching a roundabout must yield to the traffic that is already in it. Be sure to slow or come to a complete stop as you approach the roundabout because all vehicles in the roundabout have the right of way. Cars in the right-hand lane have right of way.", "15 mph or less in the designated school zone.", "No person shall operate any motorcycle with handlebars or with handgrips that are higher than the top of the shoulders of the person operating the motorcycle while properly seated upon the motorcycle.", "Give right of way to emergency vehicles and other vehicles used by law enforcement officials."],
          correct: 1,
          explanation: "Reduced speed limits in school zones give drivers more time to react to children who may enter the roadway unexpectedly."
        },
        {
          q: "When are the school zone speed restrictions in force?",
          options: ["In Cayman you keep to the LEFT of the road except when travelling in a one-way street, overtaking, or when otherwise directed by a traffic sign, police signal, or other authorized persons.", "At certain times of the day, warning lights flash outside the schools, indicating to drivers that they need to reduce their speed to 15 mph in the designated school zone to ensure the safety of youngsters.", "The operator of a motorcycle shall not overtake and pass in the same lane occupied by the vehicle being overtaken. No person shall operate a motorcycle between lanes of traffic or between adjacent lines or rows of vehicles.", "Give right of way to emergency vehicles and other vehicles used by law enforcement officials."],
          correct: 1,
          explanation: "School zone restrictions apply during arrival and dismissal times when children are most likely to be near or crossing the road."
        },
        {
          q: "When is it acceptable to use a hand-held mobile phone, or similar device, when driving or when supervising a learner driver?",
          options: ["It is never acceptable. You MUST NOT use a hand-held mobile phone, or similar device, while driving or when supervising a learner driver. The Law does allow the use of a hands-free device subject to certain conditions, but it is far safer not to stop first or use the voicemail facility.", "No person shall operate any motorcycle with handlebars or with handgrips that are higher than the top of the shoulders of the person operating the motorcycle while properly seated upon the motorcycle.", "Turning left on a red light after a full stop is allowed, unless a sign prohibits it. (Note: In Cayman, traffic drives on the left, so a left turn on red is analogous to a right turn on red in countries that drive on the right.) Four-way stops work on the basis of whoever gets to the four-way stop first proceeds first.", "Roundabouts are a frequent occurrence in Cayman and have proven to be a great way to control traffic flow. They allow traffic to flow continuously (when used correctly) without the need for traffic lights."],
          correct: 0,
          explanation: "Using a handheld phone while driving diverts attention from the road, significantly increasing crash risk. The law prohibits it; even hands-free use is a distraction."
        },
        {
          q: "What is the purpose of a roundabout?",
          options: ["You can always go around the roundabout again to avoid a confrontation. Be courteous to other drivers and give them lots of space.", "No person shall operate any motorcycle with handlebars or with handgrips that are higher than the top of the shoulders of the person operating the motorcycle while properly seated upon the motorcycle.", "Roundabouts are a frequent occurrence in Cayman and have proven to be a great way to control traffic flow. They allow traffic to flow continuously (when used correctly) without the need for traffic lights.", "Turning left on a red light after a full stop is allowed, unless a sign prohibits it. (Note: In Cayman, traffic drives on the left, so a left turn on red is analogous to a right turn on red in countries that drive on the right.) Four-way stops work on the basis of whoever gets to the four-way stop first proceeds first."],
          correct: 2,
          explanation: "Roundabouts reduce serious collision types (T-bone and head-on) by converting intersecting traffic into merging traffic flowing in one direction."
        },
        {
          q: "What direction should you enter a roundabout?",
          options: ["Always travel around a roundabout in a clockwise direction. Never turn right into a roundabout or you will turn into oncoming, one-way traffic.", "Give prior warning of any intended manoeuvre by means of hand or traffic indicator signals.", "A moped or other vehicle operating at a speed significantly slower than the speed of existing traffic on the roadway should keep as close as practical to the left side of the roadway to allow traffic moving at a normal speed to more easily pass on the right.", "Because any person operating a motorcycle or moped is subject to the same regulations and carries the same responsibilities as a driver of any other motor vehicle on the public right of way. You must share the road with all other vehicles and understand their rules."],
          correct: 0,
          explanation: "In left-hand traffic countries like Cayman, roundabout traffic flows clockwise. Entering against the flow would cause a head-on collision."
        },
        {
          q: "What is the precedence of right of way in a roundabout?",
          options: ["A moped or other vehicle operating at a speed significantly slower than the speed of existing traffic on the roadway should keep as close as practical to the left side of the roadway to allow traffic moving at a normal speed to more easily pass on the right.", "Because any person operating a motorcycle or moped is subject to the same regulations and carries the same responsibilities as a driver of any other motor vehicle on the public right of way. You must share the road with all other vehicles and understand their rules.", "All traffic approaching a roundabout must yield to the traffic that is already in it. Be sure to slow or come to a complete stop as you approach the roundabout because all vehicles in the roundabout have the right of way. Cars in the right-hand lane have right of way.", "A person propelling a moped solely by human power upon and along a sidewalk, or across a roadway upon and along a crosswalk, has all the rights and duties applicable to a pedestrian. No person shall propel a moped upon and along a sidewalk while the motor is operating."],
          correct: 2,
          explanation: "Yielding to traffic already in a roundabout prevents merging conflicts. Vehicles already circulating have established their path; entering vehicles must wait for a safe gap."
        },
        {
          q: "When you are unable to safely exit a roundabout from your current lane, what should you do?",
          options: ["The rear light or lights, the front head light or lights, and the registration plate light as prescribed by the class of vehicle driven. Lights must be illuminated at night, though it is advisable to keep them on all the time for added visibility.", "Yes. Motorcycles may be operated two abreast in a single lane, but shall not be operated more than two abreast in a single lane.", "Drive at a speed and in a manner that allows you to stop in an emergency without being involved in a collision. Keep a watch on the road behind and in front of the vehicle being driven. Maintain adequate space cushion from other vehicles.", "You can always go around the roundabout again to avoid a confrontation. Be courteous to other drivers and give them lots of space."],
          correct: 3,
          explanation: "Forcing an exit from the wrong lane creates collision risk. Going around again is the safe option and is always permitted."
        },
        {
          q: "May a car and a motorcycle share a lane side by side?",
          options: ["No. All motorcycles are entitled to full use of a lane and no motor vehicle shall be driven in such a manner as to deprive any motorcycle of the full use of a lane.", "Yes. Motorcycles may be operated two abreast in a single lane, but shall not be operated more than two abreast in a single lane.", "Give right of way to all other vehicles, comply with all signals and other lawful directions given by wardens, give prior warning of any intended manoeuvre by means of the proper indicators, and check for traffic.", "Give prior warning of any intended manoeuvre by means of hand or traffic indicator signals."],
          correct: 0,
          explanation: "Motorcycles need the full lane width for safe maneuvering, maintaining space cushion, and avoiding road hazards. Lane sharing with a car leaves insufficient safe space."
        },
        {
          q: "May two motorcycles ride side by side in a single lane?",
          options: ["All traffic approaching a roundabout must yield to the traffic that is already in it. Be sure to slow or come to a complete stop as you approach the roundabout because all vehicles in the roundabout have the right of way. Cars in the right-hand lane have right of way.", "Yes. Motorcycles may be operated two abreast in a single lane, but shall not be operated more than two abreast in a single lane.", "In the Cayman Islands there are drivers from all corners of the world where traffic laws can be quite different. Drivers may be accustomed to unusual driving practices and may make errors due to unfamiliar local traffic patterns.", "When a school bus has its lights flashing and has slowed down or stopped, drivers are NOT permitted to pass the bus from the front as well as those at the rear. Slow down and do not pass."],
          correct: 1,
          explanation: "The law explicitly permits two motorcycles to ride side by side in one lane (a common group riding practice) but limits this to two bikes to maintain safety."
        },
        {
          q: "What restrictions apply to carrying a passenger on a motorcycle?",
          options: ["A learner license holder must NOT carry a pillion. Full license holders may carry no more than one (1) passenger. That passenger should be seated facing forward with feet on the foot rests. A pillion passenger should only be carried if the motorcycle is designed/manufactured to do so.", "The operator of a motorcycle shall not overtake and pass in the same lane occupied by the vehicle being overtaken. No person shall operate a motorcycle between lanes of traffic or between adjacent lines or rows of vehicles.", "It is never acceptable. You MUST NOT use a hand-held mobile phone, or similar device, while driving or when supervising a learner driver. The Law does allow the use of a hands-free device subject to certain conditions, but it is far safer not to stop first or use the voicemail facility.", "Roundabouts are a frequent occurrence in Cayman and have proven to be a great way to control traffic flow. They allow traffic to flow continuously (when used correctly) without the need for traffic lights."],
          correct: 0,
          explanation: "Carrying passengers changes the motorcycle's handling. Learners lack the experience to manage this safely. Full license holders may carry one passenger only on a properly equipped bike."
        },
        {
          q: "What restrictions apply to a motorcycle overtaking and passing another vehicle?",
          options: ["Always travel around a roundabout in a clockwise direction. Never turn right into a roundabout or you will turn into oncoming, one-way traffic.", "It is never acceptable. No person shall operate a vehicle while wearing a headset, headphone, or other listening device which interferes with or prevents the operator from hearing surrounding sounds normally.", "All traffic approaching a roundabout must yield to the traffic that is already in it. Be sure to slow or come to a complete stop as you approach the roundabout because all vehicles in the roundabout have the right of way. Cars in the right-hand lane have right of way.", "The operator of a motorcycle shall not overtake and pass in the same lane occupied by the vehicle being overtaken. No person shall operate a motorcycle between lanes of traffic or between adjacent lines or rows of vehicles."],
          correct: 3,
          explanation: "Overtaking in the same lane or lane-splitting creates extreme hazard \u2014 the overtaken driver may not expect it, doors may open, and there is insufficient space to react safely."
        },
        {
          q: "When a moped is operated at a speed significantly slower than existing traffic on the roadway, how should it proceed?",
          options: ["Give right of way to emergency vehicles and other vehicles used by law enforcement officials.", "At certain times of the day, warning lights flash outside the schools, indicating to drivers that they need to reduce their speed to 15 mph in the designated school zone to ensure the safety of youngsters.", "You can always go around the roundabout again to avoid a confrontation. Be courteous to other drivers and give them lots of space.", "A moped or other vehicle operating at a speed significantly slower than the speed of existing traffic on the roadway should keep as close as practical to the left side of the roadway to allow traffic moving at a normal speed to more easily pass on the right."],
          correct: 3,
          explanation: "Slow-moving vehicles impede traffic flow and increase rear-end crash risk. Staying left allows faster traffic to pass safely on the right."
        },
        {
          q: "When may a moped be operated on a sidewalk or in a crosswalk?",
          options: ["A person propelling a moped solely by human power upon and along a sidewalk, or across a roadway upon and along a crosswalk, has all the rights and duties applicable to a pedestrian. No person shall propel a moped upon and along a sidewalk while the motor is operating.", "No. All motorcycles are entitled to full use of a lane and no motor vehicle shall be driven in such a manner as to deprive any motorcycle of the full use of a lane.", "Drive at a speed and in a manner that allows you to stop in an emergency without being involved in a collision. Keep a watch on the road behind and in front of the vehicle being driven. Maintain adequate space cushion from other vehicles.", "Give right of way to emergency vehicles and other vehicles used by law enforcement officials."],
          correct: 0,
          explanation: "Mopeds on sidewalks with engines running pose a danger to pedestrians. Human-powered moped use on sidewalks is treated like cycling/walking."
        },
        {
          q: "What precedence of right of way applies to a moped operated on a sidewalk?",
          options: ["Such a person shall yield the right-of-way to any pedestrian and shall give an audible signal before overtaking and passing a pedestrian.", "Roundabouts are a frequent occurrence in Cayman and have proven to be a great way to control traffic flow. They allow traffic to flow continuously (when used correctly) without the need for traffic lights.", "Give right of way to emergency vehicles and other vehicles used by law enforcement officials.", "A motorcycle must have: (1) A headlight which may or may not dip to the left. (2) A red rear light, a red reflector, a stoplight (brake light), and a registration plate light at the rear. (3) Functional amber turn signals front and rear. (4) No red light at the front. (5) No white light other than a reverse light or registration plate light to the rear. (6) No amber light other than a turn signal or emergency light to the rear. Lights must be illuminated at night."],
          correct: 0,
          explanation: "Pedestrians have priority on sidewalks. Any vehicle-like device on a sidewalk must give way to people on foot and warn them before passing."
        },
        {
          q: "What headgear is required when operating a motorcycle?",
          options: ["Every person must wear an approved motorcycle helmet meeting U.S. Department of Transportation (DOT) or U.N. Economic Commission for Europe (ECE) standards, securely fastened. Head injuries are reduced by wearing approved motorcycle helmets.", "The operator of a motorcycle shall not overtake and pass in the same lane occupied by the vehicle being overtaken. No person shall operate a motorcycle between lanes of traffic or between adjacent lines or rows of vehicles.", "16 years old.", "In the Cayman Islands there are drivers from all corners of the world where traffic laws can be quite different. Drivers may be accustomed to unusual driving practices and may make errors due to unfamiliar local traffic patterns."],
          correct: 0,
          explanation: "Helmets are legally required and proven to reduce head and neck injuries \u2014 the most common serious injuries in motorcycle crashes. Only DOT or ECE certified helmets meet the required safety standard."
        },
        {
          q: "When is wearing a headset, headphone or other listening device acceptable?",
          options: ["Give prior warning of any intended manoeuvre by means of hand or traffic indicator signals.", "It is never acceptable. No person shall operate a vehicle while wearing a headset, headphone, or other listening device which interferes with or prevents the operator from hearing surrounding sounds normally.", "15 mph or less in the designated school zone.", "Always travel around a roundabout in a clockwise direction. Never turn right into a roundabout or you will turn into oncoming, one-way traffic."],
          correct: 1,
          explanation: "Hearing is a critical safety sense for motorcyclists. Devices that block ambient sound prevent the rider from hearing approaching hazards, sirens, or other warnings."
        },
        {
          q: "What is required in the construction of a motorcycle to allow a passenger to ride legally?",
          options: ["No person shall operate any motorcycle with handlebars or with handgrips that are higher than the top of the shoulders of the person operating the motorcycle while properly seated upon the motorcycle.", "In the Cayman Islands there are drivers from all corners of the world where traffic laws can be quite different. Drivers may be accustomed to unusual driving practices and may make errors due to unfamiliar local traffic patterns.", "Give right of way to all other vehicles, comply with all signals and other lawful directions given by wardens, give prior warning of any intended manoeuvre by means of the proper indicators, and check for traffic.", "Any motorcycle carrying a passenger shall be equipped with footrests and handholds for such passenger."],
          correct: 3,
          explanation: "Footrests and handholds are safety equipment for passengers \u2014 they prevent the passenger from falling off when the motorcycle accelerates, brakes, or corners."
        },
        {
          q: "What is the legal height limit for handlebars on a motorcycle?",
          options: ["When a school bus has its lights flashing and has slowed down or stopped, drivers are NOT permitted to pass the bus from the front as well as those at the rear. Slow down and do not pass.", "You can always go around the roundabout again to avoid a confrontation. Be courteous to other drivers and give them lots of space.", "A moped or other vehicle operating at a speed significantly slower than the speed of existing traffic on the roadway should keep as close as practical to the left side of the roadway to allow traffic moving at a normal speed to more easily pass on the right.", "No person shall operate any motorcycle with handlebars or with handgrips that are higher than the top of the shoulders of the person operating the motorcycle while properly seated upon the motorcycle."],
          correct: 3,
          explanation: "Excessively high handlebars (ape hangers) reduce the rider's control over the motorcycle, impair steering leverage, and can cause fatigue \u2014 creating a safety hazard."
        },
        {
          q: "What are the requirements for lights on a motorcycle?",
          options: ["A motorcycle must have: (1) A headlight which may or may not dip to the left. (2) A red rear light, a red reflector, a stoplight (brake light), and a registration plate light at the rear. (3) Functional amber turn signals front and rear. (4) No red light at the front. (5) No white light other than a reverse light or registration plate light to the rear. (6) No amber light other than a turn signal or emergency light to the rear. Lights must be illuminated at night.", "The turning lane in the centre of some roads is designed to help drivers turn right across traffic. The lane should never be used for overtaking.", "All traffic approaching a roundabout must yield to the traffic that is already in it. Be sure to slow or come to a complete stop as you approach the roundabout because all vehicles in the roundabout have the right of way. Cars in the right-hand lane have right of way.", "No. All motorcycles are entitled to full use of a lane and no motor vehicle shall be driven in such a manner as to deprive any motorcycle of the full use of a lane."],
          correct: 0,
          explanation: "Proper lighting makes motorcycles visible to other road users and communicates the rider's intentions. Incorrect light colors can confuse other drivers (e.g., red at the front could be mistaken for a rear light)."
        },

    ],
  },
  {
    id: "before-ride", title: "Before You Ride", icon: "Settings", color: "#A47A42",
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
        {
          q: "List three steps a safe rider will take before taking off on any trip.",
          options: ["1. Wear the right protective and safety gear. 2. Become familiar with the motorcycle controls and equipment. 3. Check the mechanical condition of the motorcycle. 4. Ride responsibly \u2014 if feeling ill, dizzy, weak, or having any condition that could impair handling, find an alternative.", "Boots or shoes should be high and sturdy enough to cover your ankles and give them support. Soles should be made of hard, durable, slip-resistant material. Keep heels short so they do not catch on rough surfaces. Tuck in laces so they won't catch on your motorcycle.", "1. Be visible \u2014 wear proper clothing, use headlight, ride in the best lane position. 2. Communicate your intentions \u2014 use proper signals, brake light, and lane position. 3. Maintain an adequate space cushion. 4. Scan your path of travel 12 seconds ahead. 5. Identify and separate multiple hazards. 6. Be prepared to act \u2014 remain alert and know how to carry out proper crash-avoidance skills.", "Look for: (1) DOT or ECE certification sticker. (2) SNELL or ANSI sticker inside the helmet. (3) Manufacturer's labeling stating name, model, size, construction materials. (4) Impact absorbing liner about one-inch thick of firm polystyrene foam inside. (5) The helmet fits snugly all the way around and has no obvious defects such as cracks, loose padding, or frayed straps."],
          correct: 0,
          explanation: "Pre-ride preparation directly reduces crash risk. Gear protects in a crash, familiarity with controls prevents errors, and mechanical checks catch problems before they cause emergencies."
        },
        {
          q: "What should you do if you are feeling ill, dizzy, or weak or have any condition that could impair your handling of the bike?",
          options: ["Find an alternative means of transportation. Do not ride.", "The right clothing protects you in a collision. It also provides comfort, as well as protection from heat, cold, debris and hot and moving parts of the motorcycle. Wear a jacket even in warm weather to prevent dehydration. Many modern jackets are designed to protect without getting you overheated.", "Gloves allow a better grip and help protect your hands in a crash. Gloves should be made of leather or similar durable material. Make sure they fit snugly without extra material getting in the way of operating the clutch, brake and controls.", "Wiring (periodically inspect for fraying, chafing), Fluids (hydraulic fluids and coolants weekly), Battery (check electrolyte level, terminals clean and tight), Chain/Belt (tension and lubrication), sprockets for wear."],
          correct: 0,
          explanation: "Physical impairment affects balance, reaction time, and judgment \u2014 all critical to safe motorcycle operation. The risk to yourself and others is too great to ride while impaired."
        },
        {
          q: "What are four items of protective gear that should be worn for every ride?",
          options: ["Boots or shoes should be high and sturdy enough to cover your ankles and give them support. Soles should be made of hard, durable, slip-resistant material. Keep heels short so they do not catch on rough surfaces. Tuck in laces so they won't catch on your motorcycle.", "Before every ride check: Tires (pressure, tread, damage), Wheels, Frame, Chain or Belt, Kick-Stand, Fluids (oil level), Battery, Head-lights and Tail-light, Turn Signals, Brake Light, Control Cables and Hoses, Brakes, Clutch/Choke/Throttle, Mirrors, Horn, Fuel supply valve, Ignition/starter/engine cut-off switch, and Instrument cluster.", "Gloves allow a better grip and help protect your hands in a crash. Gloves should be made of leather or similar durable material. Make sure they fit snugly without extra material getting in the way of operating the clutch, brake and controls.", "1. An approved helmet. 2. Face or eye protection. 3. Proper shoes or boots. 4. Protective clothing (jacket, pants, gloves)."],
          correct: 3,
          explanation: "Each item protects a specific vulnerable area: helmets protect the head/neck, eye protection maintains visibility, boots protect feet/ankles, and clothing reduces abrasion injuries in a fall."
        },
        {
          q: "Crash analyses show that head and neck injuries account for a majority of serious and fatal injuries to motorcyclists. What is likely to reduce the occurrence or severity of such injuries?",
          options: ["Crashes are fairly common among beginning riders, especially in the first months of riding. Riding an unfamiliar motorcycle adds to the problem. More than half of all crashes occur on motorcycles ridden by the operator for less than six months. If you lend your motorcycle, make sure the borrower's license is motorcycle endorsed and they know how to ride before allowing them into traffic.", "The proper use of an approved helmet. Research shows that, with few exceptions, head and neck injuries are reduced by the proper use of an approved helmet. Helmeted riders are three times more likely to survive head injuries than those not wearing helmets.", "1. Wear the right protective and safety gear. 2. Become familiar with the motorcycle controls and equipment. 3. Check the mechanical condition of the motorcycle. 4. Ride responsibly \u2014 if feeling ill, dizzy, weak, or having any condition that could impair handling, find an alternative.", "The right clothing protects you in a collision. It also provides comfort, as well as protection from heat, cold, debris and hot and moving parts of the motorcycle. Wear a jacket even in warm weather to prevent dehydration. Many modern jackets are designed to protect without getting you overheated."],
          correct: 1,
          explanation: "Statistical evidence consistently shows helmets are the single most effective protective device for motorcyclists. At speeds below 30 mph, helmets can cut head injury rates by half."
        },
        {
          q: "Is a rider statistically less likely to have an accident on short trips?",
          options: ["Be visible, communicate your intentions, maintain an adequate space cushion, scan 12 seconds ahead, identify and separate multiple hazards, be prepared to act, use horn if needed, do not flash lights (in Cayman this signals permission to enter), do not split lanes.", "No. Most crashes happen on short trips (less than five miles long), just a few minutes after starting out.", "Modern ballistic synthetic mesh jackets provide for sliding and have impact-resistant armor to protect elbows and spine. Sturdy synthetic material provides good protection and is often more comfortable, especially in warm weather. Many are designed to protect without getting you overheated.", "Wiring (periodically inspect for fraying, chafing), Fluids (hydraulic fluids and coolants weekly), Battery (check electrolyte level, terminals clean and tight), Chain/Belt (tension and lubrication), sprockets for wear."],
          correct: 1,
          explanation: "Riders may be less warmed up mentally and physically at the start of trips. Short trips don't justify skipping safety gear or pre-ride checks."
        },
        {
          q: "Is a rider less likely to have an accident at slower road speeds than at highway speed?",
          options: ["The right clothing protects you in a collision. It also provides comfort, as well as protection from heat, cold, debris and hot and moving parts of the motorcycle. Wear a jacket even in warm weather to prevent dehydration. Many modern jackets are designed to protect without getting you overheated.", "No. Most riders are riding slower than 30 mph when a crash occurs. At these speeds, helmets can cut both the number and severity of head injuries by half.", "Make sure your motorcycle fits you. Your feet should be flat on the ground while you are seated on the motorcycle. If they are not, the motorcycle may be too large for you to handle safely.", "Wiring (periodically inspect for fraying, chafing), Fluids (hydraulic fluids and coolants weekly), Battery (check electrolyte level, terminals clean and tight), Chain/Belt (tension and lubrication), sprockets for wear."],
          correct: 1,
          explanation: "Crashes occur at all speeds. Low-speed crashes in local traffic are actually very common. Speed alone does not determine crash likelihood."
        },
        {
          q: "How do you determine a helmet is constructed so that it will provide the required protection?",
          options: ["1. Wear the right protective and safety gear. 2. Become familiar with the motorcycle controls and equipment. 3. Check the mechanical condition of the motorcycle. 4. Ride responsibly \u2014 if feeling ill, dizzy, weak, or having any condition that could impair handling, find an alternative.", "A plastic shatter-resistant face shield protects your whole face in a crash. It also protects from wind, dust, dirt, rain, insects, and pebbles thrown up from cars ahead. Goggles protect your eyes but won't protect the rest of your face like a face shield does. Glasses won't keep eyes from watering and might blow off when turning your head while riding.", "Look for: (1) DOT or ECE certification sticker. (2) SNELL or ANSI sticker inside the helmet. (3) Manufacturer's labeling stating name, model, size, construction materials. (4) Impact absorbing liner about one-inch thick of firm polystyrene foam inside. (5) The helmet fits snugly all the way around and has no obvious defects such as cracks, loose padding, or frayed straps.", "1. Be visible \u2014 wear proper clothing, use headlight, ride in the best lane position. 2. Communicate your intentions \u2014 use proper signals, brake light, and lane position. 3. Maintain an adequate space cushion. 4. Scan your path of travel 12 seconds ahead. 5. Identify and separate multiple hazards. 6. Be prepared to act \u2014 remain alert and know how to carry out proper crash-avoidance skills."],
          correct: 2,
          explanation: "A helmet is only as good as its construction. Proper certification and physical inspection ensure it will actually absorb impact energy in a crash rather than just looking the part."
        },
        {
          q: "In what way is a face shield superior for protection, both riding and in a crash, to glasses or goggles?",
          options: ["Find an alternative means of transportation. Do not ride.", "1. Wear the right protective and safety gear. 2. Become familiar with the motorcycle controls and equipment. 3. Check the mechanical condition of the motorcycle. 4. Ride responsibly \u2014 if feeling ill, dizzy, weak, or having any condition that could impair handling, find an alternative.", "1. An approved helmet. 2. Face or eye protection. 3. Proper shoes or boots. 4. Protective clothing (jacket, pants, gloves).", "A plastic shatter-resistant face shield protects your whole face in a crash. It also protects from wind, dust, dirt, rain, insects, and pebbles thrown up from cars ahead. Goggles protect your eyes but won't protect the rest of your face like a face shield does. Glasses won't keep eyes from watering and might blow off when turning your head while riding."],
          correct: 3,
          explanation: "Full face protection addresses multiple hazards simultaneously. Goggles and glasses leave the lower face unprotected and can fail (blow off or shatter) in ways a proper face shield does not."
        },
        {
          q: "For protection and comfort while riding, what is a better alternative to traditional leather?",
          options: ["Crashes are fairly common among beginning riders, especially in the first months of riding. Riding an unfamiliar motorcycle adds to the problem. More than half of all crashes occur on motorcycles ridden by the operator for less than six months. If you lend your motorcycle, make sure the borrower's license is motorcycle endorsed and they know how to ride before allowing them into traffic.", "No. Most crashes happen on short trips (less than five miles long), just a few minutes after starting out.", "Be visible, communicate your intentions, maintain an adequate space cushion, scan 12 seconds ahead, identify and separate multiple hazards, be prepared to act, use horn if needed, do not flash lights (in Cayman this signals permission to enter), do not split lanes.", "Modern ballistic synthetic mesh jackets provide for sliding and have impact-resistant armor to protect elbows and spine. Sturdy synthetic material provides good protection and is often more comfortable, especially in warm weather. Many are designed to protect without getting you overheated."],
          correct: 3,
          explanation: "Modern synthetic materials can match or exceed leather's protective qualities while being more comfortable in Cayman's warm climate, making riders more likely to wear proper gear consistently."
        },
        {
          q: "What qualities should you consider in selecting footwear for a ride?",
          options: ["Make sure your motorcycle fits you. Your feet should be flat on the ground while you are seated on the motorcycle. If they are not, the motorcycle may be too large for you to handle safely.", "You do \u2014 the rider. As a rider you can't be sure that other operators will see you or yield the right of way. The ability to ride aware, make critical decisions and carry them out separates responsible riders from all the rest.", "A plastic shatter-resistant face shield protects your whole face in a crash. It also protects from wind, dust, dirt, rain, insects, and pebbles thrown up from cars ahead. Goggles protect your eyes but won't protect the rest of your face like a face shield does. Glasses won't keep eyes from watering and might blow off when turning your head while riding.", "Boots or shoes should be high and sturdy enough to cover your ankles and give them support. Soles should be made of hard, durable, slip-resistant material. Keep heels short so they do not catch on rough surfaces. Tuck in laces so they won't catch on your motorcycle."],
          correct: 3,
          explanation: "Ankle injuries are common in crashes. Proper footwear provides ankle support, resists abrasion, and prevents feet from slipping off pegs or catching on the bike."
        },
        {
          q: "What is the advantage of wearing gloves when you ride?",
          options: ["Gloves allow a better grip and help protect your hands in a crash. Gloves should be made of leather or similar durable material. Make sure they fit snugly without extra material getting in the way of operating the clutch, brake and controls.", "1. Wear the right protective and safety gear. 2. Become familiar with the motorcycle controls and equipment. 3. Check the mechanical condition of the motorcycle. 4. Ride responsibly \u2014 if feeling ill, dizzy, weak, or having any condition that could impair handling, find an alternative.", "Find an alternative means of transportation. Do not ride.", "The right clothing protects you in a collision. It also provides comfort, as well as protection from heat, cold, debris and hot and moving parts of the motorcycle. Wear a jacket even in warm weather to prevent dehydration. Many modern jackets are designed to protect without getting you overheated."],
          correct: 0,
          explanation: "In any fall, the instinct is to use hands to break the fall \u2014 making hand injuries very common. Gloves protect against abrasion and maintain proper grip on controls."
        },
        {
          q: "Why is protective clothing critically important in warm weather?",
          options: ["At minimum, a street-legal motorcycle should have: headlight, tail-light and brake-light, front and rear brakes, turn signals, horn, and two mirrors.", "The proper use of an approved helmet. Research shows that, with few exceptions, head and neck injuries are reduced by the proper use of an approved helmet. Helmeted riders are three times more likely to survive head injuries than those not wearing helmets.", "Crashes are fairly common among beginning riders, especially in the first months of riding. Riding an unfamiliar motorcycle adds to the problem. More than half of all crashes occur on motorcycles ridden by the operator for less than six months. If you lend your motorcycle, make sure the borrower's license is motorcycle endorsed and they know how to ride before allowing them into traffic.", "The right clothing protects you in a collision. It also provides comfort, as well as protection from heat, cold, debris and hot and moving parts of the motorcycle. Wear a jacket even in warm weather to prevent dehydration. Many modern jackets are designed to protect without getting you overheated."],
          correct: 3,
          explanation: "Warm weather tempts riders to skip protective gear, but skin provides no protection against road abrasion. Modern technical gear offers protection AND ventilation."
        },
        {
          q: "List six steps that help you operate a motorcycle safely and responsibly.",
          options: ["Make sure your motorcycle fits you. Your feet should be flat on the ground while you are seated on the motorcycle. If they are not, the motorcycle may be too large for you to handle safely.", "1. Be visible \u2014 wear proper clothing, use headlight, ride in the best lane position. 2. Communicate your intentions \u2014 use proper signals, brake light, and lane position. 3. Maintain an adequate space cushion. 4. Scan your path of travel 12 seconds ahead. 5. Identify and separate multiple hazards. 6. Be prepared to act \u2014 remain alert and know how to carry out proper crash-avoidance skills.", "A plastic shatter-resistant face shield protects your whole face in a crash. It also protects from wind, dust, dirt, rain, insects, and pebbles thrown up from cars ahead. Goggles protect your eyes but won't protect the rest of your face like a face shield does. Glasses won't keep eyes from watering and might blow off when turning your head while riding.", "The ability to ride aware, make critical decisions, and carry them out. Remember, it is up to you to keep from being the cause of, or an unprepared participant in, any crash."],
          correct: 1,
          explanation: "These six practices address the most common causes of motorcycle crashes: not being seen, failing to communicate, following too closely, not anticipating hazards, and lacking emergency skills."
        },
        {
          q: "How do you determine a motorcycle is too big for you?",
          options: ["You do \u2014 the rider. As a rider you can't be sure that other operators will see you or yield the right of way. The ability to ride aware, make critical decisions and carry them out separates responsible riders from all the rest.", "No. Most crashes happen on short trips (less than five miles long), just a few minutes after starting out.", "The ability to ride aware, make critical decisions, and carry them out. Remember, it is up to you to keep from being the cause of, or an unprepared participant in, any crash.", "Make sure your motorcycle fits you. Your feet should be flat on the ground while you are seated on the motorcycle. If they are not, the motorcycle may be too large for you to handle safely."],
          correct: 3,
          explanation: "Being able to place feet flat on the ground is essential for balance when stopped. A motorcycle that is too tall creates instability, especially in slow maneuvers or emergency stops."
        },
        {
          q: "What are the minimum requirements for a street legal motorcycle?",
          options: ["At minimum, a street-legal motorcycle should have: headlight, tail-light and brake-light, front and rear brakes, turn signals, horn, and two mirrors.", "Gloves allow a better grip and help protect your hands in a crash. Gloves should be made of leather or similar durable material. Make sure they fit snugly without extra material getting in the way of operating the clutch, brake and controls.", "Look for: (1) DOT or ECE certification sticker. (2) SNELL or ANSI sticker inside the helmet. (3) Manufacturer's labeling stating name, model, size, construction materials. (4) Impact absorbing liner about one-inch thick of firm polystyrene foam inside. (5) The helmet fits snugly all the way around and has no obvious defects such as cracks, loose padding, or frayed straps.", "The proper use of an approved helmet. Research shows that, with few exceptions, head and neck injuries are reduced by the proper use of an approved helmet. Helmeted riders are three times more likely to survive head injuries than those not wearing helmets."],
          correct: 0,
          explanation: "These components are required for the motorcycle to be operated legally and safely on public roads \u2014 lighting for visibility, brakes for stopping, signals for communication, and mirrors for awareness."
        },
        {
          q: "What are some of the hazards of borrowing or lending a motorcycle?",
          options: ["1. Be visible \u2014 wear proper clothing, use headlight, ride in the best lane position. 2. Communicate your intentions \u2014 use proper signals, brake light, and lane position. 3. Maintain an adequate space cushion. 4. Scan your path of travel 12 seconds ahead. 5. Identify and separate multiple hazards. 6. Be prepared to act \u2014 remain alert and know how to carry out proper crash-avoidance skills.", "Crashes are fairly common among beginning riders, especially in the first months of riding. Riding an unfamiliar motorcycle adds to the problem. More than half of all crashes occur on motorcycles ridden by the operator for less than six months. If you lend your motorcycle, make sure the borrower's license is motorcycle endorsed and they know how to ride before allowing them into traffic.", "Gloves allow a better grip and help protect your hands in a crash. Gloves should be made of leather or similar durable material. Make sure they fit snugly without extra material getting in the way of operating the clutch, brake and controls.", "The proper use of an approved helmet. Research shows that, with few exceptions, head and neck injuries are reduced by the proper use of an approved helmet. Helmeted riders are three times more likely to survive head injuries than those not wearing helmets."],
          correct: 1,
          explanation: "Unfamiliarity with a motorcycle's specific controls, weight, power, and handling characteristics increases crash risk. Both borrowers and lenders share responsibility for safe outcomes."
        },
        {
          q: "What should you check before every ride?",
          options: ["You do \u2014 the rider. As a rider you can't be sure that other operators will see you or yield the right of way. The ability to ride aware, make critical decisions and carry them out separates responsible riders from all the rest.", "Before every ride check: Tires (pressure, tread, damage), Wheels, Frame, Chain or Belt, Kick-Stand, Fluids (oil level), Battery, Head-lights and Tail-light, Turn Signals, Brake Light, Control Cables and Hoses, Brakes, Clutch/Choke/Throttle, Mirrors, Horn, Fuel supply valve, Ignition/starter/engine cut-off switch, and Instrument cluster.", "No. Most crashes happen on short trips (less than five miles long), just a few minutes after starting out.", "1. Wear the right protective and safety gear. 2. Become familiar with the motorcycle controls and equipment. 3. Check the mechanical condition of the motorcycle. 4. Ride responsibly \u2014 if feeling ill, dizzy, weak, or having any condition that could impair handling, find an alternative."],
          correct: 1,
          explanation: "A minor mechanical problem that is merely inconvenient in a car can be fatal on a motorcycle. Pre-ride checks catch developing issues before they become emergencies on the road."
        },
        {
          q: "What should you check frequently, if not before every ride?",
          options: ["Crashes are fairly common among beginning riders, especially in the first months of riding. Riding an unfamiliar motorcycle adds to the problem. More than half of all crashes occur on motorcycles ridden by the operator for less than six months. If you lend your motorcycle, make sure the borrower's license is motorcycle endorsed and they know how to ride before allowing them into traffic.", "Gloves allow a better grip and help protect your hands in a crash. Gloves should be made of leather or similar durable material. Make sure they fit snugly without extra material getting in the way of operating the clutch, brake and controls.", "Wiring (periodically inspect for fraying, chafing), Fluids (hydraulic fluids and coolants weekly), Battery (check electrolyte level, terminals clean and tight), Chain/Belt (tension and lubrication), sprockets for wear.", "At minimum, a street-legal motorcycle should have: headlight, tail-light and brake-light, front and rear brakes, turn signals, horn, and two mirrors."],
          correct: 2,
          explanation: "Some components deteriorate gradually. Frequent checks catch wear and fluid consumption trends before they lead to mechanical failure while riding."
        },
        {
          q: "While riding, who carries the primary responsibility for your safety and welfare?",
          options: ["No. Most riders are riding slower than 30 mph when a crash occurs. At these speeds, helmets can cut both the number and severity of head injuries by half.", "You do \u2014 the rider. As a rider you can't be sure that other operators will see you or yield the right of way. The ability to ride aware, make critical decisions and carry them out separates responsible riders from all the rest.", "The right clothing protects you in a collision. It also provides comfort, as well as protection from heat, cold, debris and hot and moving parts of the motorcycle. Wear a jacket even in warm weather to prevent dehydration. Many modern jackets are designed to protect without getting you overheated.", "1. An approved helmet. 2. Face or eye protection. 3. Proper shoes or boots. 4. Protective clothing (jacket, pants, gloves)."],
          correct: 1,
          explanation: "Motorcyclists are more vulnerable than car drivers and cannot rely on others to protect them. Taking personal responsibility for safety through awareness and skill is the only reliable protection."
        },
        {
          q: "How can you lessen your chances of a crash occurring while you are riding?",
          options: ["1. An approved helmet. 2. Face or eye protection. 3. Proper shoes or boots. 4. Protective clothing (jacket, pants, gloves).", "No. Most crashes happen on short trips (less than five miles long), just a few minutes after starting out.", "Modern ballistic synthetic mesh jackets provide for sliding and have impact-resistant armor to protect elbows and spine. Sturdy synthetic material provides good protection and is often more comfortable, especially in warm weather. Many are designed to protect without getting you overheated.", "Be visible, communicate your intentions, maintain an adequate space cushion, scan 12 seconds ahead, identify and separate multiple hazards, be prepared to act, use horn if needed, do not flash lights (in Cayman this signals permission to enter), do not split lanes."],
          correct: 3,
          explanation: "Most crashes are preventable. Active risk management \u2014 being seen, signaling clearly, maintaining space, and scanning ahead \u2014 addresses the leading causes of motorcycle crashes."
        },
        {
          q: "What separates responsible riders from all the rest?",
          options: ["You do \u2014 the rider. As a rider you can't be sure that other operators will see you or yield the right of way. The ability to ride aware, make critical decisions and carry them out separates responsible riders from all the rest.", "The ability to ride aware, make critical decisions, and carry them out. Remember, it is up to you to keep from being the cause of, or an unprepared participant in, any crash.", "Make sure your motorcycle fits you. Your feet should be flat on the ground while you are seated on the motorcycle. If they are not, the motorcycle may be too large for you to handle safely.", "The proper use of an approved helmet. Research shows that, with few exceptions, head and neck injuries are reduced by the proper use of an approved helmet. Helmeted riders are three times more likely to survive head injuries than those not wearing helmets."],
          correct: 1,
          explanation: "Skill and knowledge reduce crash risk, but it is the rider's mindset \u2014 constant vigilance, good judgment, and preparedness \u2014 that is the ultimate safety factor."
        },

    ],
  },
  {
    id: "ride-abilities", title: "Ride Within Your Abilities", icon: "Gauge", color: "#66735F",
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

**In a turn:** If possible, straighten the bike upright first, then brake. Avoid using the front brake while in a turn position. If you must brake while leaning, apply brakes lightly and reduce throttle.` },
      { title: "Turning",
        content: `Riders often try to take curves too fast, ending up in another lane or overreacting and braking too hard.

**Approach turns with caution — SLOW, LOOK, PRESS:**
• **SLOW** — Reduce speed before the turn
• **LOOK** — Look through the turn to where you want to go. Turn your head, not shoulders.
• **PRESS** — To lean the motorcycle, press on the handle-grip in the direction of the turn. Press left = lean left = go left.` },
      { title: "Following Distance & Lane Positions",
        content: `**Maintain a minimum of 6 seconds** behind the vehicle ahead.

**To gauge following distance:**
1. Pick a marker on or near the road ahead
      2. When the vehicle ahead passes it, count: "one-thousand-one" through "one-thousand-six"
      3. If you reach the marker before "six," you're too close

      **Increase to 10 seconds when:**
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
Leader rides in the right side of the lane. Second rider stays 2 seconds behind in the left side. This keeps the group close with safe distances. Pass one at a time. Single-file for curves, turning, and entering/leaving a highway.` },
    ],
    quiz: [
        {
          q: "What is the best way to learn how to safely ride a motorcycle?",
          options: ["A sudden change in power to the rear wheel can cause a skid. It is best to change gears before entering a turn. However, sometimes shifting while in the turn is necessary \u2014 if so, remember to do so smoothly.", "Learning to use the gears when downshifting, turning or starting on hills is important for safe motorcycle operation. A sudden change in power to the rear wheel can cause a skid. Smooth clutch operation prevents lurching, wheel spin, and skids.", "Through practice, along with knowing and obeying the rules of the road. Completing the CIMRA Motorcycle Rider's Course with its on-cycle riding sessions is highly recommended. Crash studies show that rider course graduates have far lower injury and fatality rates compared to untrained riders.", "Shift down through the gears with the clutch as you slow or stop. Remain in first gear while you are stopped so that you can move out quickly if you need to."],
          correct: 2,
          explanation: "Formal training provides structured skill development in a controlled environment. It teaches proper technique, hazard recognition, and emergency maneuvers that save lives."
        },
        {
          q: "What are some of the key points to control a motorcycle well?",
          options: ["Through practice, along with knowing and obeying the rules of the road. Completing the CIMRA Motorcycle Rider's Course with its on-cycle riding sessions is highly recommended. Crash studies show that rider course graduates have far lower injury and fatality rates compared to untrained riders.", "A sudden change in power to the rear wheel can cause a skid. It is best to change gears before entering a turn. However, sometimes shifting while in the turn is necessary \u2014 if so, remember to do so smoothly.", "Learning to use the gears when downshifting, turning or starting on hills is important for safe motorcycle operation. A sudden change in power to the rear wheel can cause a skid. Smooth clutch operation prevents lurching, wheel spin, and skids.", "Posture (sit to steer, not to hold yourself up), Seat (sit far enough forward so arms are slightly bent), Hands (hold grips firmly, right wrist flat), Knees (against the gas tank for balance), Feet (firmly on foot-pegs, near controls, toes not pointing down)."],
          correct: 3,
          explanation: "Correct body position gives the rider maximum control. Each position element has a specific safety function \u2014 from preventing accidental throttle use (flat wrist) to maintaining balance in turns (knees against tank)."
        },
        {
          q: "Why is skilled use of the clutch and gearbox especially important?",
          options: ["Posture (sit to steer, not to hold yourself up), Seat (sit far enough forward so arms are slightly bent), Hands (hold grips firmly, right wrist flat), Knees (against the gas tank for balance), Feet (firmly on foot-pegs, near controls, toes not pointing down).", "A sudden change in power to the rear wheel can cause a skid. It is best to change gears before entering a turn. However, sometimes shifting while in the turn is necessary \u2014 if so, remember to do so smoothly.", "Learning to use the gears when downshifting, turning or starting on hills is important for safe motorcycle operation. A sudden change in power to the rear wheel can cause a skid. Smooth clutch operation prevents lurching, wheel spin, and skids.", "Shift down through the gears with the clutch as you slow or stop. Remain in first gear while you are stopped so that you can move out quickly if you need to."],
          correct: 2,
          explanation: "The clutch and gearbox control power delivery to the rear wheel. Abrupt changes can break traction and cause loss of control, especially in corners or on slippery surfaces."
        },
        {
          q: "If you are unable to shift to the correct gear before entering a turn, why is it important to take care to shift and operate the clutch smoothly in the curve?",
          options: ["Posture (sit to steer, not to hold yourself up), Seat (sit far enough forward so arms are slightly bent), Hands (hold grips firmly, right wrist flat), Knees (against the gas tank for balance), Feet (firmly on foot-pegs, near controls, toes not pointing down).", "Shift down through the gears with the clutch as you slow or stop. Remain in first gear while you are stopped so that you can move out quickly if you need to.", "A sudden change in power to the rear wheel can cause a skid. It is best to change gears before entering a turn. However, sometimes shifting while in the turn is necessary \u2014 if so, remember to do so smoothly.", "Learning to use the gears when downshifting, turning or starting on hills is important for safe motorcycle operation. A sudden change in power to the rear wheel can cause a skid. Smooth clutch operation prevents lurching, wheel spin, and skids."],
          correct: 2,
          explanation: "In a corner, the motorcycle's tires are already working hard to maintain traction for turning. Any sudden change in power or braking can overwhelm tire grip and cause a skid or fall."
        },
        {
          q: "What should you remember every time you stop, slow or stop?",
          options: ["Shift down through the gears with the clutch as you slow or stop. Remain in first gear while you are stopped so that you can move out quickly if you need to.", "A sudden change in power to the rear wheel can cause a skid. It is best to change gears before entering a turn. However, sometimes shifting while in the turn is necessary \u2014 if so, remember to do so smoothly.", "Learning to use the gears when downshifting, turning or starting on hills is important for safe motorcycle operation. A sudden change in power to the rear wheel can cause a skid. Smooth clutch operation prevents lurching, wheel spin, and skids.", "Posture (sit to steer, not to hold yourself up), Seat (sit far enough forward so arms are slightly bent), Hands (hold grips firmly, right wrist flat), Knees (against the gas tank for balance), Feet (firmly on foot-pegs, near controls, toes not pointing down)."],
          correct: 0,
          explanation: "Staying in first gear when stopped ensures immediate power delivery when needed \u2014 critical for escaping a dangerous situation. It also prevents stalling when pulling away."
        },
        {
          q: "What is the best way to learn how to safely ride a motorcycle? (Revisited in context of lane positions)",
          options: ["Your lane position should: increase your ability to see and be seen, avoid others' blind spots, avoid surface hazards, protect your lane from other drivers, communicate your intentions, avoid wind blast from other vehicles, and provide an escape route.", "Move into a single-file formation when riding curves, turning, entering or leaving a highway.", "The greatest potential for conflict between you and other traffic is at intersections. Ride with your headlight on in a lane position that increases your visibility to drivers. Provide a space cushion. Cover the clutch and both brakes to reduce reaction time. Select a lane position to increase your visibility to the driver. Do not change speed or position abruptly.", "Park at a 90-degree angle to the curb with your rear wheel touching the curb."],
          correct: 0,
          explanation: "Lane position is an active safety tool. The best position changes constantly based on traffic, road conditions, and other hazards \u2014 there is no single 'best' position for all situations."
        },
        {
          q: "How can you discourage lane sharing by others?",
          options: ["Staggered formation. The leader rides in the right side of the lane, the second rider stays one second behind in the left side of the lane. A third rider maintains the right position, two seconds behind the first rider. The fourth rider would keep a two-second distance behind the second rider.", "Keep a center-portion position whenever drivers might be tempted to squeeze by you \u2014 in heavy bumper-to-bumper traffic, when they want to pass you, when you are preparing to turn at an intersection, and when you are getting in an exit lane or leaving a highway.", "Equip and adjust motorcycle for passenger weight. Instruct passenger before you start: mount only after engine started, sit as far forward as possible without crowding you, hold firmly to your waist/hips/belt, keep both feet on the pegs even when stopped, keep legs away from muffler/chains/moving parts, lean as you lean, avoid unnecessary talk or motion. Tell passenger to tighten hold when approaching surface problems, about to start from a stop, or making a sudden move.", "Move into a single-file formation when riding curves, turning, entering or leaving a highway."],
          correct: 1,
          explanation: "Riding in the center of the lane occupies the full width visually and physically, making it difficult for other vehicles to share the lane without clearly invading the motorcycle's space."
        },
        {
          q: "Why should you avoid riding directly beside cars or trucks in adjacent lanes?",
          options: ["You may be in the blind spot of a car in the next lane, which could switch into your lane without warning. If the car in the next lane has blocked your escape, if your view is blocked, speed up or drop back to find a place clear of traffic on both sides.", "The greatest potential for conflict between you and other traffic is at intersections. Ride with your headlight on in a lane position that increases your visibility to drivers. Provide a space cushion. Cover the clutch and both brakes to reduce reaction time. Select a lane position to increase your visibility to the driver. Do not change speed or position abruptly.", "Keep the group small (4-5 max, split larger groups), keep the group together, plan the route and ensure everyone knows it, put beginners up front behind the leader, have experienced riders at the back, follow those behind (tail-ender sets the pace), keep distance (staggered formation), don't pair up (never ride directly alongside another rider), start lane changes early.", "Riders in a staggered formation should pass one at a time. First, the lead rider should pull out and pass when it is safe, then go to the left position and continue riding at passing speed to open room for the next rider. After the first rider passes safely, the second rider moves up to the right position and watches for a safe chance to pass."],
          correct: 0,
          explanation: "Riding in another vehicle's blind spot removes the driver's ability to see you. A lane change by that vehicle would have no warning and leave no escape time."
        },
        {
          q: "When approaching intersections you should remember what?",
          options: ["Riders in a staggered formation should pass one at a time. First, the lead rider should pull out and pass when it is safe, then go to the left position and continue riding at passing speed to open room for the next rider. After the first rider passes safely, the second rider moves up to the right position and watches for a safe chance to pass.", "The greatest potential for conflict between you and other traffic is at intersections. Ride with your headlight on in a lane position that increases your visibility to drivers. Provide a space cushion. Cover the clutch and both brakes to reduce reaction time. Select a lane position to increase your visibility to the driver. Do not change speed or position abruptly.", "Move into a single-file formation when riding curves, turning, entering or leaving a highway.", "Adjust the suspension to handle the additional weight, add a few pounds of tire pressure, adjust mirror and headlight for the changed angle, instruct passenger thoroughly, adjust riding technique (ride slower, start slowing earlier, open up larger space cushion)."],
          correct: 1,
          explanation: "Over half of all motorcycle-car crashes happen at intersections, primarily because car drivers fail to see motorcycles. Proactive visibility and preparedness are critical."
        },
        {
          q: "What part of the lane should you ride in when passing parked cars?",
          options: ["When passing parked cars, stay toward the right of your lane. This helps you avoid problems caused by doors opening, drivers getting out of cars, or people stepping from between cars.", "Keep a center-portion position whenever drivers might be tempted to squeeze by you \u2014 in heavy bumper-to-bumper traffic, when they want to pass you, when you are preparing to turn at an intersection, and when you are getting in an exit lane or leaving a highway.", "Keep the group small (4-5 max, split larger groups), keep the group together, plan the route and ensure everyone knows it, put beginners up front behind the leader, have experienced riders at the back, follow those behind (tail-ender sets the pace), keep distance (staggered formation), don't pair up (never ride directly alongside another rider), start lane changes early.", "Adjust the suspension to handle the additional weight, add a few pounds of tire pressure, adjust mirror and headlight for the changed angle, instruct passenger thoroughly, adjust riding technique (ride slower, start slowing earlier, open up larger space cushion)."],
          correct: 0,
          explanation: "An unexpectedly opened car door ('dooring') is a serious hazard for motorcyclists. Riding away from the door zone reduces the risk of collision."
        },
        {
          q: "What are special measures to consider when carrying a passenger or heavy load?",
          options: ["Adjust the suspension to handle the additional weight, add a few pounds of tire pressure, adjust mirror and headlight for the changed angle, instruct passenger thoroughly, adjust riding technique (ride slower, start slowing earlier, open up larger space cushion).", "Keep a center-portion position whenever drivers might be tempted to squeeze by you \u2014 in heavy bumper-to-bumper traffic, when they want to pass you, when you are preparing to turn at an intersection, and when you are getting in an exit lane or leaving a highway.", "Riders in a staggered formation should pass one at a time. First, the lead rider should pull out and pass when it is safe, then go to the left position and continue riding at passing speed to open room for the next rider. After the first rider passes safely, the second rider moves up to the right position and watches for a safe chance to pass.", "The greatest potential for conflict between you and other traffic is at intersections. Ride with your headlight on in a lane position that increases your visibility to drivers. Provide a space cushion. Cover the clutch and both brakes to reduce reaction time. Select a lane position to increase your visibility to the driver. Do not change speed or position abruptly."],
          correct: 0,
          explanation: "Extra weight fundamentally changes the motorcycle's handling \u2014 longer stopping distances, different cornering behavior, and altered suspension response. Preparation prevents loss of control."
        },
        {
          q: "What equipment considerations apply to carrying passengers or a heavy load?",
          options: ["Equip and adjust motorcycle for passenger weight. Instruct passenger before you start: mount only after engine started, sit as far forward as possible without crowding you, hold firmly to your waist/hips/belt, keep both feet on the pegs even when stopped, keep legs away from muffler/chains/moving parts, lean as you lean, avoid unnecessary talk or motion. Tell passenger to tighten hold when approaching surface problems, about to start from a stop, or making a sudden move.", "Keep the load low (fasten in saddlebags or low on frame), keep the load forward (over or in front of rear axle), distribute the load evenly (equal weight in both saddlebags), secure the load firmly (elastic cords/bungee cords with multiple attachment points), check the load often (stop and verify it hasn't moved).", "Need a proper seat large enough to hold both without crowding, foot pegs for the passenger, protective equipment for the passenger (same gear recommended for operators), and the motorcycle must be designed/manufactured to carry a passenger.", "Adjust the suspension to handle the additional weight, add a few pounds of tire pressure, adjust mirror and headlight for the changed angle, instruct passenger thoroughly, adjust riding technique (ride slower, start slowing earlier, open up larger space cushion)."],
          correct: 2,
          explanation: "Passengers need equipment as much as riders. Without foot pegs, a passenger may fall or pull the rider off balance. Without protective gear, they face the same injury risks as the rider."
        },
        {
          q: "What procedures should be involved in carrying passengers?",
          options: ["Equip and adjust motorcycle for passenger weight. Instruct passenger before you start: mount only after engine started, sit as far forward as possible without crowding you, hold firmly to your waist/hips/belt, keep both feet on the pegs even when stopped, keep legs away from muffler/chains/moving parts, lean as you lean, avoid unnecessary talk or motion. Tell passenger to tighten hold when approaching surface problems, about to start from a stop, or making a sudden move.", "Need a proper seat large enough to hold both without crowding, foot pegs for the passenger, protective equipment for the passenger (same gear recommended for operators), and the motorcycle must be designed/manufactured to carry a passenger.", "Move into a single-file formation when riding curves, turning, entering or leaving a highway.", "Keep a center-portion position whenever drivers might be tempted to squeeze by you \u2014 in heavy bumper-to-bumper traffic, when they want to pass you, when you are preparing to turn at an intersection, and when you are getting in an exit lane or leaving a highway."],
          correct: 0,
          explanation: "An unprepared passenger can destabilize the motorcycle. Clear communication and proper instructions prevent the passenger from making unexpected movements that could cause a crash."
        },
        {
          q: "What procedures should be involved in carrying cargo?",
          options: ["Need a proper seat large enough to hold both without crowding, foot pegs for the passenger, protective equipment for the passenger (same gear recommended for operators), and the motorcycle must be designed/manufactured to carry a passenger.", "When passing parked cars, stay toward the right of your lane. This helps you avoid problems caused by doors opening, drivers getting out of cars, or people stepping from between cars.", "Park at a 90-degree angle to the curb with your rear wheel touching the curb.", "Keep the load low (fasten in saddlebags or low on frame), keep the load forward (over or in front of rear axle), distribute the load evenly (equal weight in both saddlebags), secure the load firmly (elastic cords/bungee cords with multiple attachment points), check the load often (stop and verify it hasn't moved)."],
          correct: 3,
          explanation: "Improperly loaded cargo raises the center of gravity, shifts weight distribution, and can work loose \u2014 all of which destabilize the motorcycle, particularly in turns and during braking."
        },
        {
          q: "What are a few measures to take before and during a group ride to keep it safer?",
          options: ["When passing parked cars, stay toward the right of your lane. This helps you avoid problems caused by doors opening, drivers getting out of cars, or people stepping from between cars.", "Keep the group small (4-5 max, split larger groups), keep the group together, plan the route and ensure everyone knows it, put beginners up front behind the leader, have experienced riders at the back, follow those behind (tail-ender sets the pace), keep distance (staggered formation), don't pair up (never ride directly alongside another rider), start lane changes early.", "You may be in the blind spot of a car in the next lane, which could switch into your lane without warning. If the car in the next lane has blocked your escape, if your view is blocked, speed up or drop back to find a place clear of traffic on both sides.", "Your lane position should: increase your ability to see and be seen, avoid others' blind spots, avoid surface hazards, protect your lane from other drivers, communicate your intentions, avoid wind blast from other vehicles, and provide an escape route."],
          correct: 1,
          explanation: "Group riding introduces coordination challenges. A structured approach prevents the group from becoming separated, ensures weaker riders are supported, and maintains safe spacing."
        },
        {
          q: "What is the preferred formation to ride in a group?",
          options: ["Staggered formation. The leader rides in the right side of the lane, the second rider stays one second behind in the left side of the lane. A third rider maintains the right position, two seconds behind the first rider. The fourth rider would keep a two-second distance behind the second rider.", "When passing parked cars, stay toward the right of your lane. This helps you avoid problems caused by doors opening, drivers getting out of cars, or people stepping from between cars.", "Keep the group small (4-5 max, split larger groups), keep the group together, plan the route and ensure everyone knows it, put beginners up front behind the leader, have experienced riders at the back, follow those behind (tail-ender sets the pace), keep distance (staggered formation), don't pair up (never ride directly alongside another rider), start lane changes early.", "Need a proper seat large enough to hold both without crowding, foot pegs for the passenger, protective equipment for the passenger (same gear recommended for operators), and the motorcycle must be designed/manufactured to carry a passenger."],
          correct: 0,
          explanation: "Staggered formation keeps the group close together (good for visibility and traffic management) while maintaining a safe distance from the rider directly ahead and providing space to maneuver."
        },
        {
          q: "What is the safest procedure when passing another vehicle on the road while with a group?",
          options: ["Move into a single-file formation when riding curves, turning, entering or leaving a highway.", "Keep the group small (4-5 max, split larger groups), keep the group together, plan the route and ensure everyone knows it, put beginners up front behind the leader, have experienced riders at the back, follow those behind (tail-ender sets the pace), keep distance (staggered formation), don't pair up (never ride directly alongside another rider), start lane changes early.", "Riders in a staggered formation should pass one at a time. First, the lead rider should pull out and pass when it is safe, then go to the left position and continue riding at passing speed to open room for the next rider. After the first rider passes safely, the second rider moves up to the right position and watches for a safe chance to pass.", "Keep a center-portion position whenever drivers might be tempted to squeeze by you \u2014 in heavy bumper-to-bumper traffic, when they want to pass you, when you are preparing to turn at an intersection, and when you are getting in an exit lane or leaving a highway."],
          correct: 2,
          explanation: "Passing one at a time minimizes the time spent in the oncoming lane and ensures each rider independently confirms it is safe before passing \u2014 group pressure to 'go together' is dangerous."
        },
        {
          q: "What is usually the safest practice for a group riding curves, turns, or leaving a highway?",
          options: ["Move into a single-file formation when riding curves, turning, entering or leaving a highway.", "Your lane position should: increase your ability to see and be seen, avoid others' blind spots, avoid surface hazards, protect your lane from other drivers, communicate your intentions, avoid wind blast from other vehicles, and provide an escape route.", "Need a proper seat large enough to hold both without crowding, foot pegs for the passenger, protective equipment for the passenger (same gear recommended for operators), and the motorcycle must be designed/manufactured to carry a passenger.", "Park at a 90-degree angle to the curb with your rear wheel touching the curb."],
          correct: 0,
          explanation: "Curves and turns require maximum lane width for each rider to negotiate safely. Staggered formation in curves can cause riders to interfere with each other's lines."
        },
        {
          q: "What is the best practice for parking a motorcycle at the roadside?",
          options: ["Equip and adjust motorcycle for passenger weight. Instruct passenger before you start: mount only after engine started, sit as far forward as possible without crowding you, hold firmly to your waist/hips/belt, keep both feet on the pegs even when stopped, keep legs away from muffler/chains/moving parts, lean as you lean, avoid unnecessary talk or motion. Tell passenger to tighten hold when approaching surface problems, about to start from a stop, or making a sudden move.", "You may be in the blind spot of a car in the next lane, which could switch into your lane without warning. If the car in the next lane has blocked your escape, if your view is blocked, speed up or drop back to find a place clear of traffic on both sides.", "Park at a 90-degree angle to the curb with your rear wheel touching the curb.", "Adjust the suspension to handle the additional weight, add a few pounds of tire pressure, adjust mirror and headlight for the changed angle, instruct passenger thoroughly, adjust riding technique (ride slower, start slowing earlier, open up larger space cushion)."],
          correct: 2,
          explanation: "Parking perpendicular to the curb with the rear wheel against it maximizes stability and makes the motorcycle visible to traffic. It also makes it easier to pull away safely."
        },

    ],
  },
  {
    id: "safe-practices", title: "Safe Riding Practices", icon: "Eye", color: "#6F7D85",
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
• **Increase distance** — open up 5+ second following distance
• **Use the car ahead** — their headlights show the road better than your high beam
• **Use your high beam** whenever not following or meeting a car
• **Be flexible about lane position** — choose whatever portion helps you see, be seen, and maintain a space cushion` },
    ],
    quiz: [
        {
          q: "What is the meaning of the S.E.E. process?",
          options: ["Wear bright-colored or reflective clothing (helmet and jacket). Use your headlight on all the time. Ride in a lane position that puts you in drivers' fields of vision. Avoid blind spots. Use signals and brake light to communicate intentions. Use your horn when necessary.", "S.E.E. stands for Search, Evaluate, Execute. It is a three-step process used to make appropriate judgments and apply them correctly in different traffic situations. Search aggressively ahead, to the sides and behind. Evaluate how hazards interact to create risk. Execute your decision by communicating presence, adjusting speed, or adjusting position.", "Reduce speed (ride slower than during the day, especially on unfamiliar roads). Increase following distance (open up to three-second or more). Use the car ahead's headlights as additional visibility aid. Use your high beam when not following or meeting a car. Be visible (wear reflective materials). Be flexible about lane position (use whatever portion helps you see, be seen, and keep adequate space cushion).", "Apply the old adage \u2014 one step at a time \u2014 to handle two or more hazards. Adjust speed to permit two hazards to separate. Then deal with them one at a time as single hazards. When there are three or more hazards, weigh the consequences of each and give equal distance to the hazards."],
          correct: 1,
          explanation: "SEE is a systematic mental framework that helps riders manage complex traffic environments. By constantly cycling through these three steps, riders stay ahead of developing hazards."
        },
        {
          q: "What approach allows you to handle complex situations involving two or more hazards occurring at one time?",
          options: ["Mirrors have blind spots \u2014 areas behind and to the sides not visible in mirrors. Before changing lanes, turn your head and look to the side for other vehicles. On multi-lane roads, check the far lane and the one next to you. Some motorcycles have rounded (convex) mirrors that provide a wider view but make cars appear farther away than they really are \u2014 get familiar with them.", "S.E.E. stands for Search, Evaluate, Execute. It is a three-step process used to make appropriate judgments and apply them correctly in different traffic situations. Search aggressively ahead, to the sides and behind. Evaluate how hazards interact to create risk. Execute your decision by communicating presence, adjusting speed, or adjusting position.", "Wear bright-colored or reflective clothing (helmet and jacket). Use your headlight on all the time. Ride in a lane position that puts you in drivers' fields of vision. Avoid blind spots. Use signals and brake light to communicate intentions. Use your horn when necessary.", "Apply the old adage \u2014 one step at a time \u2014 to handle two or more hazards. Adjust speed to permit two hazards to separate. Then deal with them one at a time as single hazards. When there are three or more hazards, weigh the consequences of each and give equal distance to the hazards."],
          correct: 3,
          explanation: "Trying to manage multiple hazards simultaneously overloads decision-making. Separating hazards by adjusting speed reduces complexity to manageable individual events."
        },
        {
          q: "What steps can you take to increase your visibility to other drivers?",
          options: ["Value: Good idea to give a quick beep before passing anyone who may move into your lane; use horn to get someone's attention quickly; in emergency, press the horn button loud and long. Danger: A motorcycle's horn isn't as loud as a car's \u2014 don't rely on it. Also, in some countries including the Cayman Islands, flashing lights (not horn use) indicates approval for entry or crossing \u2014 DO NOT flash lights to warn of your approach.", "Wear bright-colored or reflective clothing (helmet and jacket). Use your headlight on all the time. Ride in a lane position that puts you in drivers' fields of vision. Avoid blind spots. Use signals and brake light to communicate intentions. Use your horn when necessary.", "Reduce speed (ride slower than during the day, especially on unfamiliar roads). Increase following distance (open up to three-second or more). Use the car ahead's headlights as additional visibility aid. Use your high beam when not following or meeting a car. Be visible (wear reflective materials). Be flexible about lane position (use whatever portion helps you see, be seen, and keep adequate space cushion).", "Apply the old adage \u2014 one step at a time \u2014 to handle two or more hazards. Adjust speed to permit two hazards to separate. Then deal with them one at a time as single hazards. When there are three or more hazards, weigh the consequences of each and give equal distance to the hazards."],
          correct: 1,
          explanation: "Studies show that in crashes involving motorcycles, drivers often say they never saw the motorcycle. Each visibility measure independently increases detection probability; together they are very effective."
        },
        {
          q: "What is an inherent hazard in the use of mirrors and how do you overcome it?",
          options: ["Mirrors have blind spots \u2014 areas behind and to the sides not visible in mirrors. Before changing lanes, turn your head and look to the side for other vehicles. On multi-lane roads, check the far lane and the one next to you. Some motorcycles have rounded (convex) mirrors that provide a wider view but make cars appear farther away than they really are \u2014 get familiar with them.", "S.E.E. stands for Search, Evaluate, Execute. It is a three-step process used to make appropriate judgments and apply them correctly in different traffic situations. Search aggressively ahead, to the sides and behind. Evaluate how hazards interact to create risk. Execute your decision by communicating presence, adjusting speed, or adjusting position.", "Value: Good idea to give a quick beep before passing anyone who may move into your lane; use horn to get someone's attention quickly; in emergency, press the horn button loud and long. Danger: A motorcycle's horn isn't as loud as a car's \u2014 don't rely on it. Also, in some countries including the Cayman Islands, flashing lights (not horn use) indicates approval for entry or crossing \u2014 DO NOT flash lights to warn of your approach.", "Wear bright-colored or reflective clothing (helmet and jacket). Use your headlight on all the time. Ride in a lane position that puts you in drivers' fields of vision. Avoid blind spots. Use signals and brake light to communicate intentions. Use your horn when necessary."],
          correct: 0,
          explanation: "Relying solely on mirrors for lane changes is insufficient because of blind spots. Physical head checks are the only way to see into blind spot zones before committing to a lane change."
        },
        {
          q: "What is the value and danger of using a horn in traffic?",
          options: ["Value: Good idea to give a quick beep before passing anyone who may move into your lane; use horn to get someone's attention quickly; in emergency, press the horn button loud and long. Danger: A motorcycle's horn isn't as loud as a car's \u2014 don't rely on it. Also, in some countries including the Cayman Islands, flashing lights (not horn use) indicates approval for entry or crossing \u2014 DO NOT flash lights to warn of your approach.", "Mirrors have blind spots \u2014 areas behind and to the sides not visible in mirrors. Before changing lanes, turn your head and look to the side for other vehicles. On multi-lane roads, check the far lane and the one next to you. Some motorcycles have rounded (convex) mirrors that provide a wider view but make cars appear farther away than they really are \u2014 get familiar with them.", "Apply the old adage \u2014 one step at a time \u2014 to handle two or more hazards. Adjust speed to permit two hazards to separate. Then deal with them one at a time as single hazards. When there are three or more hazards, weigh the consequences of each and give equal distance to the hazards.", "S.E.E. stands for Search, Evaluate, Execute. It is a three-step process used to make appropriate judgments and apply them correctly in different traffic situations. Search aggressively ahead, to the sides and behind. Evaluate how hazards interact to create risk. Execute your decision by communicating presence, adjusting speed, or adjusting position."],
          correct: 0,
          explanation: "The horn is a useful alert tool but has limitations. The Cayman-specific note about light flashing is critical \u2014 what warns drivers in other countries signals 'go ahead' in Cayman, creating a dangerous misunderstanding."
        },
        {
          q: "How can you increase your safety margin when riding in the reduced visibility conditions at night?",
          options: ["Value: Good idea to give a quick beep before passing anyone who may move into your lane; use horn to get someone's attention quickly; in emergency, press the horn button loud and long. Danger: A motorcycle's horn isn't as loud as a car's \u2014 don't rely on it. Also, in some countries including the Cayman Islands, flashing lights (not horn use) indicates approval for entry or crossing \u2014 DO NOT flash lights to warn of your approach.", "Wear bright-colored or reflective clothing (helmet and jacket). Use your headlight on all the time. Ride in a lane position that puts you in drivers' fields of vision. Avoid blind spots. Use signals and brake light to communicate intentions. Use your horn when necessary.", "Reduce speed (ride slower than during the day, especially on unfamiliar roads). Increase following distance (open up to three-second or more). Use the car ahead's headlights as additional visibility aid. Use your high beam when not following or meeting a car. Be visible (wear reflective materials). Be flexible about lane position (use whatever portion helps you see, be seen, and keep adequate space cushion).", "Mirrors have blind spots \u2014 areas behind and to the sides not visible in mirrors. Before changing lanes, turn your head and look to the side for other vehicles. On multi-lane roads, check the far lane and the one next to you. Some motorcycles have rounded (convex) mirrors that provide a wider view but make cars appear farther away than they really are \u2014 get familiar with them."],
          correct: 2,
          explanation: "Night riding significantly reduces visibility distances, makes hazards harder to see, and makes the rider less visible to others. Each of these techniques compensates for specific night-riding vulnerabilities."
        },

    ],
  },
  {
    id: "crash-avoidance", title: "Crash Avoidance", icon: "AlertTriangle", color: "#A1594A",
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
        {
          q: "What is the best procedure when a quick stop is necessary?",
          options: ["Apply both brakes at the same time. Don't grab the front brake \u2014 squeeze it firmly and progressively. If the front wheel locks, release the front brake immediately and reapply it firmly. At the same time, press down on the rear brake. Always use both brakes simultaneously. The front brake can provide 70% or more of the potential stopping power.", "Reduce speed before reaching the slippery surface. Avoid sudden moves (smooth acceleration, braking, steering). Use both brakes but squeeze gradually to avoid locking. Keep the motorcycle straight up if possible. Watch for oil spots when you put your foot down to stop or park. Ride on the least-slippery portion of the lane.", "If the motorcycle starts handling differently, it may be a tire failure. A front-wheel flat feels 'heavy' in the steering. A rear tire flat causes the back of the motorcycle to jerk or sway from side to side. If either tire suddenly loses air, react quickly to keep your balance. Pull off and check the tires.", "Grooves and rain gratings (may cause weaving), pavement seams parallel to course (approach at 45 degrees or more), uneven surfaces and obstacles (bumps, broken pavement, potholes), slippery surfaces (wet paint, metal plates, manhole covers)."],
          correct: 0,
          explanation: "Using both brakes maximizes stopping force. The front brake is more powerful but must be applied smoothly to avoid locking. The rear brake provides additional stopping power and stability."
        },
        {
          q: "When a quick stop will not prevent a collision, what should you do?",
          options: ["Wet pavement (especially just after rain starts), gravel/marl roads or where sand and gravel collect, lane markings/steel plates/manhole covers when wet, center of lane (oil drippings from cars), dirt and gravel at edges and ramps, wet leaves, rain grooves/bridge gratings.", "If the motorcycle starts handling differently, it may be a tire failure. A front-wheel flat feels 'heavy' in the steering. A rear tire flat causes the back of the motorcycle to jerk or sway from side to side. If either tire suddenly loses air, react quickly to keep your balance. Pull off and check the tires.", "If no traffic is present, start at the outside of a curve to increase your line of sight and the effective radius of the turn. As you turn, move toward the inside of the curve, and as you pass the center, move to the outside to exit. (Outside-inside-outside line). A good cornering line choice before entering a curve maximizes straight-line braking distance.", "Swerve \u2014 make a sudden change in direction. Apply a small amount of hand pressure on the handle grip on the side of your intended direction of escape. This will cause the motorcycle to lean quickly. Keep your body upright and allow the motorcycle to lean in the direction of the turn. Make your escape route the target of your vision."],
          correct: 3,
          explanation: "When stopping distance is insufficient, swerving may be the only option to avoid a collision. Proper swerving technique (countersteering) allows quick direction changes without losing control."
        },
        {
          q: "What rule should you follow when braking and swerving are required?",
          options: ["Swerve \u2014 make a sudden change in direction. Apply a small amount of hand pressure on the handle grip on the side of your intended direction of escape. This will cause the motorcycle to lean quickly. Keep your body upright and allow the motorcycle to lean in the direction of the turn. Make your escape route the target of your vision.", "Wet pavement, gravel/marl roads, lane markings/steel plates/manhole covers especially when wet, sand and gravel at road edges, dirt/debris buildups, wet leaves, rain dries faster on some sections than others creating inconsistent grip.", "Try to avoid obstacles by slowing or going around them. If you must go over the obstacle, approach it at as close to a 90-degree angle as possible, slow down as much as possible, make sure the motorcycle is straight, rise slightly off the seat with weight on foot pegs, roll on the throttle slightly just before contact to lighten the front end.", "IF BRAKING IS REQUIRED, SEPARATE IT FROM SWERVING. Brake before or after \u2014 never while swerving."],
          correct: 3,
          explanation: "Simultaneously braking and swerving divides available tire traction between two demands. In most situations, tires cannot handle both at once \u2014 doing so risks a skid and loss of control."
        },
        {
          q: "When traffic allows, what is the best path through the typical curve on the road?",
          options: ["Swerve \u2014 make a sudden change in direction. Apply a small amount of hand pressure on the handle grip on the side of your intended direction of escape. This will cause the motorcycle to lean quickly. Keep your body upright and allow the motorcycle to lean in the direction of the turn. Make your escape route the target of your vision.", "Hold handle grips firmly. Ease off the throttle gradually. Avoid using the brake on the flat tire (if known). Keep a straight course. Gradually work to the side of the road. Pull off and check the tires.", "If no traffic is present, start at the outside of a curve to increase your line of sight and the effective radius of the turn. As you turn, move toward the inside of the curve, and as you pass the center, move to the outside to exit. (Outside-inside-outside line). A good cornering line choice before entering a curve maximizes straight-line braking distance.", "Reduce speed before reaching the slippery surface. Avoid sudden moves (smooth acceleration, braking, steering). Use both brakes but squeeze gradually to avoid locking. Keep the motorcycle straight up if possible. Watch for oil spots when you put your foot down to stop or park. Ride on the least-slippery portion of the lane."],
          correct: 2,
          explanation: "The outside-inside-outside line maximizes the radius of the arc being ridden, which allows higher safe speeds, better visibility into the curve, and more margin for error."
        },
        {
          q: "What are some road surface conditions that present increased hazard?",
          options: ["Wet pavement (especially just after rain starts), gravel/marl roads or where sand and gravel collect, lane markings/steel plates/manhole covers when wet, center of lane (oil drippings from cars), dirt and gravel at edges and ramps, wet leaves, rain grooves/bridge gratings.", "If the motorcycle starts handling differently, it may be a tire failure. A front-wheel flat feels 'heavy' in the steering. A rear tire flat causes the back of the motorcycle to jerk or sway from side to side. If either tire suddenly loses air, react quickly to keep your balance. Pull off and check the tires.", "Reduce speed before reaching the slippery surface. Avoid sudden moves (smooth acceleration, braking, steering). Use both brakes but squeeze gradually to avoid locking. Keep the motorcycle straight up if possible. Watch for oil spots when you put your foot down to stop or park. Ride on the least-slippery portion of the lane.", "Grooves and rain gratings (may cause weaving), pavement seams parallel to course (approach at 45 degrees or more), uneven surfaces and obstacles (bumps, broken pavement, potholes), slippery surfaces (wet paint, metal plates, manhole covers)."],
          correct: 0,
          explanation: "Each of these surfaces reduces tire traction. Being aware of them allows riders to reduce speed, choose better line, and apply brakes and throttle more gently before reaching the hazard."
        },
        {
          q: "What is the best way to handle an obstacle or hazard in the road?",
          options: ["A wobble occurs when the front wheel and handlebars suddenly start to shake from side to side at any speed. It can be traced to improper loading, unsuitable accessories, or incorrect tire pressure. To handle a wobble: grip the handlebars firmly but don't fight it, close the throttle gradually to slow down (do NOT apply brakes \u2014 this could make it worse), move weight as far forward and down as possible.", "Apply both brakes at the same time. Don't grab the front brake \u2014 squeeze it firmly and progressively. If the front wheel locks, release the front brake immediately and reapply it firmly. At the same time, press down on the rear brake. Always use both brakes simultaneously. The front brake can provide 70% or more of the potential stopping power.", "Twist the throttle back and forth several times \u2014 this may free it. If the throttle stays stuck, immediately operate the engine cut-off switch and pull in the clutch at the same time. This removes power from the rear wheel. Once the motorcycle is under control, pull off and stop. Check the throttle cable carefully before riding again.", "Try to avoid obstacles by slowing or going around them. If you must go over the obstacle, approach it at as close to a 90-degree angle as possible, slow down as much as possible, make sure the motorcycle is straight, rise slightly off the seat with weight on foot pegs, roll on the throttle slightly just before contact to lighten the front end."],
          correct: 3,
          explanation: "Approaching an obstacle at a right angle prevents the wheel from deflecting sideways (which causes a fall). Rising off the seat uses legs as shock absorbers, reducing impact forces transferred to the frame."
        },
        {
          q: "What are some surfaces or conditions where you should expect reduction of traction?",
          options: ["Try to avoid obstacles by slowing or going around them. If you must go over the obstacle, approach it at as close to a 90-degree angle as possible, slow down as much as possible, make sure the motorcycle is straight, rise slightly off the seat with weight on foot pegs, roll on the throttle slightly just before contact to lighten the front end.", "Reduce speed before reaching the slippery surface. Avoid sudden moves (smooth acceleration, braking, steering). Use both brakes but squeeze gradually to avoid locking. Keep the motorcycle straight up if possible. Watch for oil spots when you put your foot down to stop or park. Ride on the least-slippery portion of the lane.", "Wet pavement, gravel/marl roads, lane markings/steel plates/manhole covers especially when wet, sand and gravel at road edges, dirt/debris buildups, wet leaves, rain dries faster on some sections than others creating inconsistent grip.", "Hold handle grips firmly. Ease off the throttle gradually. Avoid using the brake on the flat tire (if known). Keep a straight course. Gradually work to the side of the road. Pull off and check the tires."],
          correct: 2,
          explanation: "Traction loss is the primary cause of single-vehicle motorcycle crashes. Knowing where reduced traction is likely allows proactive speed reduction and smoother control inputs."
        },
        {
          q: "How is it best to ride safely on slippery surfaces?",
          options: ["Reduce speed before reaching the slippery surface. Avoid sudden moves (smooth acceleration, braking, steering). Use both brakes but squeeze gradually to avoid locking. Keep the motorcycle straight up if possible. Watch for oil spots when you put your foot down to stop or park. Ride on the least-slippery portion of the lane.", "Apply both brakes at the same time. Don't grab the front brake \u2014 squeeze it firmly and progressively. If the front wheel locks, release the front brake immediately and reapply it firmly. At the same time, press down on the rear brake. Always use both brakes simultaneously. The front brake can provide 70% or more of the potential stopping power.", "A wobble occurs when the front wheel and handlebars suddenly start to shake from side to side at any speed. It can be traced to improper loading, unsuitable accessories, or incorrect tire pressure. To handle a wobble: grip the handlebars firmly but don't fight it, close the throttle gradually to slow down (do NOT apply brakes \u2014 this could make it worse), move weight as far forward and down as possible.", "IF BRAKING IS REQUIRED, SEPARATE IT FROM SWERVING. Brake before or after \u2014 never while swerving."],
          correct: 0,
          explanation: "Slippery surfaces reduce the margin for error. Smooth inputs and reduced speed keep tire demands within available traction limits. Staying upright maximizes the tire contact patch."
        },
        {
          q: "What are some pavement features that commonly present hazards?",
          options: ["If the motorcycle starts handling differently, it may be a tire failure. A front-wheel flat feels 'heavy' in the steering. A rear tire flat causes the back of the motorcycle to jerk or sway from side to side. If either tire suddenly loses air, react quickly to keep your balance. Pull off and check the tires.", "Grooves and rain gratings (may cause weaving), pavement seams parallel to course (approach at 45 degrees or more), uneven surfaces and obstacles (bumps, broken pavement, potholes), slippery surfaces (wet paint, metal plates, manhole covers).", "Wet pavement, gravel/marl roads, lane markings/steel plates/manhole covers especially when wet, sand and gravel at road edges, dirt/debris buildups, wet leaves, rain dries faster on some sections than others creating inconsistent grip.", "If no traffic is present, start at the outside of a curve to increase your line of sight and the effective radius of the turn. As you turn, move toward the inside of the curve, and as you pass the center, move to the outside to exit. (Outside-inside-outside line). A good cornering line choice before entering a curve maximizes straight-line braking distance."],
          correct: 1,
          explanation: "Each of these features can catch a tire, deflect the wheel unexpectedly, or significantly reduce traction. Knowing them allows riders to adjust approach angle, speed, and technique."
        },
        {
          q: "How can you generally recognize a tire failure while riding?",
          options: ["Try to avoid obstacles by slowing or going around them. If you must go over the obstacle, approach it at as close to a 90-degree angle as possible, slow down as much as possible, make sure the motorcycle is straight, rise slightly off the seat with weight on foot pegs, roll on the throttle slightly just before contact to lighten the front end.", "Wet pavement (especially just after rain starts), gravel/marl roads or where sand and gravel collect, lane markings/steel plates/manhole covers when wet, center of lane (oil drippings from cars), dirt and gravel at edges and ramps, wet leaves, rain grooves/bridge gratings.", "Hold handle grips firmly. Ease off the throttle gradually. Avoid using the brake on the flat tire (if known). Keep a straight course. Gradually work to the side of the road. Pull off and check the tires.", "If the motorcycle starts handling differently, it may be a tire failure. A front-wheel flat feels 'heavy' in the steering. A rear tire flat causes the back of the motorcycle to jerk or sway from side to side. If either tire suddenly loses air, react quickly to keep your balance. Pull off and check the tires."],
          correct: 3,
          explanation: "Early recognition of tire failure allows controlled response. The handling symptoms described are distinctive \u2014 recognizing them quickly and responding correctly (easing throttle, holding grips firmly, keeping straight) can prevent a crash."
        },
        {
          q: "What should you do in the event of a tire failure?",
          options: ["Apply both brakes at the same time. Don't grab the front brake \u2014 squeeze it firmly and progressively. If the front wheel locks, release the front brake immediately and reapply it firmly. At the same time, press down on the rear brake. Always use both brakes simultaneously. The front brake can provide 70% or more of the potential stopping power.", "If no traffic is present, start at the outside of a curve to increase your line of sight and the effective radius of the turn. As you turn, move toward the inside of the curve, and as you pass the center, move to the outside to exit. (Outside-inside-outside line). A good cornering line choice before entering a curve maximizes straight-line braking distance.", "Hold handle grips firmly. Ease off the throttle gradually. Avoid using the brake on the flat tire (if known). Keep a straight course. Gradually work to the side of the road. Pull off and check the tires.", "Wet pavement (especially just after rain starts), gravel/marl roads or where sand and gravel collect, lane markings/steel plates/manhole covers when wet, center of lane (oil drippings from cars), dirt and gravel at edges and ramps, wet leaves, rain grooves/bridge gratings."],
          correct: 2,
          explanation: "Abrupt braking or steering inputs with a flat tire can cause a crash. Gradual deceleration and keeping the motorcycle as straight as possible gives the best chance of controlled safe stopping."
        },
        {
          q: "What should you do if your throttle sticks open?",
          options: ["Twist the throttle back and forth several times \u2014 this may free it. If the throttle stays stuck, immediately operate the engine cut-off switch and pull in the clutch at the same time. This removes power from the rear wheel. Once the motorcycle is under control, pull off and stop. Check the throttle cable carefully before riding again.", "Grooves and rain gratings (may cause weaving), pavement seams parallel to course (approach at 45 degrees or more), uneven surfaces and obstacles (bumps, broken pavement, potholes), slippery surfaces (wet paint, metal plates, manhole covers).", "Reduce speed before reaching the slippery surface. Avoid sudden moves (smooth acceleration, braking, steering). Use both brakes but squeeze gradually to avoid locking. Keep the motorcycle straight up if possible. Watch for oil spots when you put your foot down to stop or park. Ride on the least-slippery portion of the lane.", "If no traffic is present, start at the outside of a curve to increase your line of sight and the effective radius of the turn. As you turn, move toward the inside of the curve, and as you pass the center, move to the outside to exit. (Outside-inside-outside line). A good cornering line choice before entering a curve maximizes straight-line braking distance."],
          correct: 0,
          explanation: "A stuck throttle rapidly accelerates the motorcycle to dangerous speeds. The cut-off switch and clutch immediately remove power; pulling over safely and inspecting the cause prevents recurrence."
        },
        {
          q: "What is 'wobble'?",
          options: ["A wobble occurs when the front wheel and handlebars suddenly start to shake from side to side at any speed. It can be traced to improper loading, unsuitable accessories, or incorrect tire pressure. To handle a wobble: grip the handlebars firmly but don't fight it, close the throttle gradually to slow down (do NOT apply brakes \u2014 this could make it worse), move weight as far forward and down as possible.", "Try to avoid obstacles by slowing or going around them. If you must go over the obstacle, approach it at as close to a 90-degree angle as possible, slow down as much as possible, make sure the motorcycle is straight, rise slightly off the seat with weight on foot pegs, roll on the throttle slightly just before contact to lighten the front end.", "If no traffic is present, start at the outside of a curve to increase your line of sight and the effective radius of the turn. As you turn, move toward the inside of the curve, and as you pass the center, move to the outside to exit. (Outside-inside-outside line). A good cornering line choice before entering a curve maximizes straight-line braking distance.", "Apply both brakes at the same time. Don't grab the front brake \u2014 squeeze it firmly and progressively. If the front wheel locks, release the front brake immediately and reapply it firmly. At the same time, press down on the rear brake. Always use both brakes simultaneously. The front brake can provide 70% or more of the potential stopping power."],
          correct: 0,
          explanation: "Wobble is a resonance phenomenon in the steering system. Fighting it or braking can amplify the oscillation. Gradually reducing speed while staying calm allows the wobble to dampen and stop."
        },

    ],
  },
  {
    id: "impaired", title: "Riding Impaired", icon: "AlertTriangle", color: "#7B4D46",
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
        {
          q: "What are some factors which can impair your ability to ride a motorcycle safely?",
          options: ["In Cayman Islands, a person with a BAC of 0.08 or above is considered intoxicated. It doesn't matter how many drinks that took \u2014 it is the BAC in your blood that determines whether you are riding legally.", "Long trips, exposure to elements (wind, cold, rain), artificial stimulants (caffeine, etc.) that lead to extreme fatigue when they wear off, dehydration, and physical discomfort.", "Alcohol, other drugs (prescription and non-prescription), fatigue, emotions (anger, stress, depression, aggression, euphoria), and physical impairment (illness, injury).", "1. The amount of alcohol you consume. 2. How fast you drink. 3. Your body weight."],
          correct: 2,
          explanation: "All of these factors affect the mental and physical capabilities that safe motorcycle riding demands \u2014 judgment, reaction time, balance, vision, and coordination."
        },
        {
          q: "What are three factors that play a major part in determining blood alcohol content?",
          options: ["Alcohol, other drugs (prescription and non-prescription), fatigue, emotions (anger, stress, depression, aggression, euphoria), and physical impairment (illness, injury).", "First offense: Fine of up to $1000 or imprisonment for up to six months, or both. Second or subsequent offense: Fine of $2000 and imprisonment for 12 months, or both. Additionally, a driver can be disqualified for 12 months or any longer period. Plus lawyer's fees, lost work time, court/alcohol-education program costs, public transportation costs while license is suspended, and the psychological cost of being tagged a 'drunk driver.'", "Long trips, exposure to elements (wind, cold, rain), artificial stimulants (caffeine, etc.) that lead to extreme fatigue when they wear off, dehydration, and physical discomfort.", "1. The amount of alcohol you consume. 2. How fast you drink. 3. Your body weight."],
          correct: 3,
          explanation: "BAC is a function of how much alcohol enters the bloodstream relative to body mass and how quickly the body can process it. Understanding these factors helps riders make informed decisions about drinking and riding."
        },
        {
          q: "What is the allowable BAC in Cayman Islands?",
          options: ["1. The amount of alcohol you consume. 2. How fast you drink. 3. Your body weight.", "In Cayman Islands, a person with a BAC of 0.08 or above is considered intoxicated. It doesn't matter how many drinks that took \u2014 it is the BAC in your blood that determines whether you are riding legally.", "Just as drugs and alcohol can cloud judgment and performance, anger, stress, depression, aggression, or euphoria can present a dangerous distraction. Caution and prudence are much more under the operator's control than luck. If you're emotionally distracted, find another way to travel.", "Alcohol, other drugs (prescription and non-prescription), fatigue, emotions (anger, stress, depression, aggression, euphoria), and physical impairment (illness, injury)."],
          correct: 1,
          explanation: "BAC is the legal standard because it directly measures alcohol's effect on the body. Individual tolerance varies, but impairment begins well below 0.08 \u2014 judgment and skill begin deteriorating at very low BAC levels."
        },
        {
          q: "What are the possible consequences of riding under the influence of alcohol?",
          options: ["First offense: Fine of up to $1000 or imprisonment for up to six months, or both. Second or subsequent offense: Fine of $2000 and imprisonment for 12 months, or both. Additionally, a driver can be disqualified for 12 months or any longer period. Plus lawyer's fees, lost work time, court/alcohol-education program costs, public transportation costs while license is suspended, and the psychological cost of being tagged a 'drunk driver.'", "Just as drugs and alcohol can cloud judgment and performance, anger, stress, depression, aggression, or euphoria can present a dangerous distraction. Caution and prudence are much more under the operator's control than luck. If you're emotionally distracted, find another way to travel.", "1. The amount of alcohol you consume. 2. How fast you drink. 3. Your body weight.", "Alcohol, other drugs (prescription and non-prescription), fatigue, emotions (anger, stress, depression, aggression, euphoria), and physical impairment (illness, injury)."],
          correct: 0,
          explanation: "The legal penalties are severe and escalating, but the real cost is the risk of death or serious injury to yourself or others. Impaired riding accounts for a significant proportion of fatal motorcycle crashes."
        },
        {
          q: "What are some factors that can contribute to fatigue while riding?",
          options: ["Just as drugs and alcohol can cloud judgment and performance, anger, stress, depression, aggression, or euphoria can present a dangerous distraction. Caution and prudence are much more under the operator's control than luck. If you're emotionally distracted, find another way to travel.", "1. The amount of alcohol you consume. 2. How fast you drink. 3. Your body weight.", "Long trips, exposure to elements (wind, cold, rain), artificial stimulants (caffeine, etc.) that lead to extreme fatigue when they wear off, dehydration, and physical discomfort.", "First offense: Fine of up to $1000 or imprisonment for up to six months, or both. Second or subsequent offense: Fine of $2000 and imprisonment for 12 months, or both. Additionally, a driver can be disqualified for 12 months or any longer period. Plus lawyer's fees, lost work time, court/alcohol-education program costs, public transportation costs while license is suspended, and the psychological cost of being tagged a 'drunk driver.'"],
          correct: 2,
          explanation: "Riding a motorcycle requires more physical and mental effort than driving a car. Fatigue severely impairs all the skills needed for safe riding \u2014 it is estimated as a factor in many crashes."
        },
        {
          q: "Why is your emotional state important to your safety when riding?",
          options: ["In Cayman Islands, a person with a BAC of 0.08 or above is considered intoxicated. It doesn't matter how many drinks that took \u2014 it is the BAC in your blood that determines whether you are riding legally.", "1. The amount of alcohol you consume. 2. How fast you drink. 3. Your body weight.", "First offense: Fine of up to $1000 or imprisonment for up to six months, or both. Second or subsequent offense: Fine of $2000 and imprisonment for 12 months, or both. Additionally, a driver can be disqualified for 12 months or any longer period. Plus lawyer's fees, lost work time, court/alcohol-education program costs, public transportation costs while license is suspended, and the psychological cost of being tagged a 'drunk driver.'", "Just as drugs and alcohol can cloud judgment and performance, anger, stress, depression, aggression, or euphoria can present a dangerous distraction. Caution and prudence are much more under the operator's control than luck. If you're emotionally distracted, find another way to travel."],
          correct: 3,
          explanation: "Emotional arousal consumes cognitive resources needed for safe riding. An angry or distressed rider is less attentive, takes more risks, and responds less effectively to hazards."
        },

    ],
  },
  {
    id: "emergency", title: "When Bad Things Happen", icon: "Heart", color: "#8B5D55",
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
• **Helmet removal** — do NOT remove a helmet unless it is life-threatening, such as when the rider is not breathing

**A course in CPR and basic first aid is invaluable.**` },
      { title: "Insurance & Evading Officers",
        content: `**Insurance:** All motorcycles MUST have insurance. Check your coverage before you ride.

**Evading a Peace Officer:** Failure to follow their direction or attempting to evade can place you, the officers, and everyone around you in serious jeopardy. This could result in serious prison sentence, heavy fine, or both.` },
    ],
    quiz: [
        {
          q: "What should you do if you are involved in, or witness, a crash?",
          options: ["Modern ballistic synthetic mesh jackets provide for sliding and have impact-resistant armor to protect elbows and spine. Sturdy synthetic material provides good protection and is often more comfortable, especially in warm weather. Many are designed to protect without getting you overheated.", "Secure the Scene: Assess for dangers to bystanders, approaching traffic and those involved. Mark the site to direct traffic safely around the area. Identify those involved. Apply First Aid: Look for anyone with a significant injury. Offer immediate first aid \u2014 manage the airway (ensure it is open and unobstructed), check for breathing, check for pulse and severe bleeding, stabilize (don't move someone with an injury unless their position places them in imminent danger). Call for emergency services.", "At minimum, a street-legal motorcycle should have: headlight, tail-light and brake-light, front and rear brakes, turn signals, horn, and two mirrors.", "You may be in the blind spot of a car in the next lane, which could switch into your lane without warning. If the car in the next lane has blocked your escape, if your view is blocked, speed up or drop back to find a place clear of traffic on both sides."],
          correct: 1,
          explanation: "Improper response to a crash can worsen injuries or create additional crashes. Securing the scene prevents further collisions; proper first aid follows medical priority (airway, breathing, circulation)."
        },
        {
          q: "Aside from license and registration, what documentation is advisable when riding?",
          options: ["Such a person shall yield the right-of-way to any pedestrian and shall give an audible signal before overtaking and passing a pedestrian.", "Insurance documentation. All motorcyclists MUST have insurance. Check with your insurance company about your coverage before you buy or ride a motorcycle.", "Equip and adjust motorcycle for passenger weight. Instruct passenger before you start: mount only after engine started, sit as far forward as possible without crowding you, hold firmly to your waist/hips/belt, keep both feet on the pegs even when stopped, keep legs away from muffler/chains/moving parts, lean as you lean, avoid unnecessary talk or motion. Tell passenger to tighten hold when approaching surface problems, about to start from a stop, or making a sudden move.", "When passing parked cars, stay toward the right of your lane. This helps you avoid problems caused by doors opening, drivers getting out of cars, or people stepping from between cars."],
          correct: 1,
          explanation: "Insurance is legally required for all motorcyclists in the Cayman Islands. Without it, a rider involved in a crash could face severe financial liability for damages and medical costs."
        },

    ],
  },
  {
    id: "practical", title: "Practical Skills & Testing", icon: "Target", color: "#6B705D",
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
    id: "resources", title: "Resources", icon: "MapPin", color: "#6B625A",
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

function shuffleArray(items) {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function randomizeQuestion(question) {
  if (!question?.options) return question;

  const shuffledOptions = shuffleArray(
    question.options.map((option, index) => ({ option, index }))
  );

  return {
    ...question,
    options: shuffledOptions.map(item => item.option),
    correct: shuffledOptions.findIndex(item => item.index === question.correct),
  };
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

function QuizView({ quiz, chapterTitle, chapterColor, onBack, onComplete }) {
  const color = chapterColor || C.gold;
  const [questions] = useState(() => quiz.map(randomizeQuestion));
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const animKey = useAnimKey(current);

  const q = questions[current];

  const handleSelect = (index) => {
    if (showResult) return;

    setSelected(index);
    setShowResult(true);

    const isCorrect = index === q.correct;
    if (isCorrect) {
      setScore((prev) => prev + 1);
      setStreak((prev) => {
        const next = prev + 1;
        setBestStreak((best) => Math.max(best, next));
        return next;
      });
    } else {
      setStreak(0);
    }

    setAnswers((prev) => ([
      ...prev,
      {
        question: q.q,
        selected: index,
        correct: q.correct,
        isCorrect,
        explanation: q.explanation,
      },
    ]));
  };

  const handleNext = () => {
    if (!showResult) return;

    if (current < questions.length - 1) {
      setCurrent((prev) => prev + 1);
      setSelected(null);
      setShowResult(false);
      return;
    }

    setFinished(true);
  };

  const handleRetry = () => {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setAnswers([]);
    setFinished(false);
    setStreak(0);
    setBestStreak(0);
    setShowResult(false);
  };

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const passed = pct >= 80;

    return (
      <div className="anim-scale-in" style={{ padding: "32px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 52, animation: "heroFloat 3s ease-in-out infinite", marginBottom: 12 }}>
          {passed ? "🎓" : "📖"}
        </div>
        <p style={{ color: color, fontSize: 12, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 }}>
          {chapterTitle}
        </p>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: passed ? C.emerald : C.amber, marginBottom: 6, letterSpacing: -0.5 }}>
          {passed ? "Chapter Passed!" : "Keep Studying!"}
        </h2>

        <div style={{ marginBottom: 8, display: "flex", justifyContent: "center" }}>
          <ProgressRing progress={pct} size={120} stroke={8} color={passed ? C.emerald : C.amber} />
        </div>

        <p style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: "12px 0 4px" }}>
          {score} / {questions.length}
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

        {answers.filter((answer) => !answer.isCorrect).length > 0 && (
          <div style={{ width: "100%", textAlign: "left" }} className="anim-slide-in-up">
            <p style={{ color: C.red, fontSize: 13, fontWeight: 700, marginBottom: 10, letterSpacing: 0.5, textTransform: "uppercase" }}>
              Review Incorrect
            </p>
            {answers.filter((answer) => !answer.isCorrect).map((answer, index) => {
              const original = questions.find((question) => question.q === answer.question);
              return (
                <div key={index} style={{ background: C.card, borderRadius: 12, padding: 14, marginBottom: 10, borderLeft: `3px solid ${C.red}` }}>
                  <p style={{ color: C.text, fontSize: 13, fontWeight: 600, marginBottom: 6, lineHeight: 1.4 }}>{answer.question}</p>
                  <p style={{ color: C.red, fontSize: 12 }}>✗ {original?.options[answer.selected]}</p>
                  <p style={{ color: C.emerald, fontSize: 12, marginTop: 2 }}>✓ {original?.options[answer.correct]}</p>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, gap: 12 }}>
        <div>
          <p style={{ color: color, fontSize: 12, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase", margin: 0 }}>
            {chapterTitle}
          </p>
          <p style={{ color: C.dim, fontSize: 13, margin: "4px 0 0" }}>Question {current + 1} of {questions.length}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {streak >= 2 && (
            <span className="anim-pop-in" style={{ color: C.amber, fontSize: 13, fontWeight: 700 }}>
              🔥 {streak}
            </span>
          )}
        </div>
      </div>

      <div style={{ height: 3, background: C.border, borderRadius: 2, marginBottom: 28, overflow: "hidden" }}>
        <div style={{
          height: 3, background: `linear-gradient(90deg, ${color}, ${color}88)`,
          borderRadius: 2, width: `${(current / questions.length) * 100}%`,
          transition: "width 0.5s cubic-bezier(0.34,1.56,0.64,1)",
        }} />
      </div>

      <div key={animKey} className="anim-slide-in-up">
        <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 24, lineHeight: 1.5, letterSpacing: -0.3 }}>
          {q.q}
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {q.options.map((opt, index) => {
            let bg = C.card;
            let border = C.border2;
            let col = "#B0BCDC";
            let icon = null;

            if (showResult) {
              if (index === q.correct) {
                bg = "#052E16";
                border = C.emerald;
                col = "#D1FAE5";
                icon = <Check size={14} />;
              } else if (index === selected) {
                bg = "#450A0A";
                border = C.red;
                col = "#FEE2E2";
                icon = <X size={14} />;
              }
            } else if (index === selected) {
              bg = "#0A1F3F";
              border = color;
              col = C.text;
            }

            return (
              <button key={index} onClick={() => handleSelect(index)}
                style={{
                  padding: "14px 16px", background: bg, border: `2px solid ${border}`,
                  borderRadius: 14, color: col, cursor: showResult ? "default" : "pointer",
                  fontSize: 14, textAlign: "left", display: "flex", alignItems: "center", gap: 12,
                  transition: "all 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                  transform: "scale(1)",
                  fontFamily: "inherit",
                }}
                onMouseDown={e => { if (!showResult) e.currentTarget.style.transform = "scale(0.97)"; }}
                onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
                onTouchStart={e => { if (!showResult) e.currentTarget.style.transform = "scale(0.97)"; }}
                onTouchEnd={e => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                <span style={{
                  width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center",
                  justifyContent: "center", background: showResult && index === q.correct ? C.emerald
                    : showResult && index === selected ? C.red : C.bg,
                  fontSize: 12, fontWeight: 800, flexShrink: 0, color: showResult ? "#fff" : C.muted,
                  transition: "all 0.25s",
                }}>
                  {icon || String.fromCharCode(65 + index)}
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
          {current < questions.length - 1 ? "Next Question →" : "See Results 🏆"}
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
function FullTestView({ chapters, onBack }) {
  const allQ = chapters.filter(c => c.quiz).flatMap(c => c.quiz.map(q => ({ ...q, chapter: c.title, color: c.color })));
  const [shuffled] = useState(() => shuffleArray(allQ.map(randomizeQuestion)).slice(0, 50));
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
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
    if (selected !== null) return;
    setSelected(idx);

    const isCorrect = idx === q.correct;
    setAnswers(prev => ([
      ...prev,
      {
        question: q.q,
        selected: idx,
        correct: q.correct,
        options: q.options,
        explanation: q.explanation,
        chapter: q.chapter,
        isCorrect,
      },
    ]));

    if (isCorrect) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (selected === null) return;
    if (current < shuffled.length - 1) {
      setCurrent(c => c + 1); setSelected(null); setAnimKey(k => k + 1);
    } else {
      setFinished(true);
    }
  };

  if (finished) {
    const pct = Math.round((score / shuffled.length) * 100);
    const passed = pct >= 80;
    const incorrectAnswers = answers.filter(a => !a.isCorrect);
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
        <p style={{ color: C.muted, fontSize: 13, maxWidth: 280, margin: "10px auto 20px", lineHeight: 1.6 }}>
          {passed ? "Outstanding! You're well prepared for the official written test." : "Review your weak chapters and try again. You need 80% to pass."}
        </p>

        {incorrectAnswers.length > 0 && (
          <div style={{ textAlign: "left", margin: "0 0 20px" }}>
            <p style={{ color: C.text, fontSize: 13, fontWeight: 800, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>
              Review Answers
            </p>
            {incorrectAnswers.map((item, idx) => (
              <div key={`${item.question}-${idx}`}
                style={{
                  background: C.card,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 10,
                }}>
                <p style={{ color: C.text, fontSize: 13, fontWeight: 700, margin: "0 0 6px", lineHeight: 1.5 }}>{item.question}</p>
                <p style={{ color: C.red, fontSize: 12, margin: "0 0 4px" }}>Your answer: {item.options[item.selected]}</p>
                <p style={{ color: C.emerald, fontSize: 12, margin: "0 0 6px" }}>Correct answer: {item.options[item.correct]}</p>
                <p style={{ color: C.muted, fontSize: 12, margin: 0, lineHeight: 1.5 }}>{item.explanation}</p>
              </div>
            ))}
          </div>
        )}

        <button onClick={onBack} style={{ ...btnStyle(C.border, C.border2, C.text, true), width: "100%", marginBottom: 10 }}>
          ← Back to Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px 18px" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: 20 }}>
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
            const isSelected = i === selected;
            const bg = isSelected ? `${C.gold}18` : C.card;
            const border = isSelected ? C.gold : C.border2;
            const col = isSelected ? C.text : "#C8BFB2";

            return (
              <button key={i} onClick={() => handleSelect(i)}
                style={{
                  padding: "13px 15px", background: bg, border: `2px solid ${border}`,
                  borderRadius: 13, color: col, cursor: selected !== null ? "default" : "pointer",
                  fontSize: 14, textAlign: "left", display: "flex", alignItems: "center", gap: 10,
                  transition: "all 0.22s", fontFamily: "inherit",
                }}
                onMouseDown={e => { if (selected === null) e.currentTarget.style.transform = "scale(0.97)"; }}
                onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
                onTouchStart={e => { if (selected === null) e.currentTarget.style.transform = "scale(0.97)"; }}
                onTouchEnd={e => { e.currentTarget.style.transform = "scale(1)"; }}
              >
                <span style={{
                  width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center",
                  justifyContent: "center", background: isSelected ? C.gold : C.bg,
                  fontSize: 11, fontWeight: 800, flexShrink: 0, color: isSelected ? "#fff" : C.muted,
                }}>
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {selected !== null && (
        <button className="anim-slide-in-up" onClick={handleNext}
          style={{
            marginTop: 18, width: "100%", padding: 16,
            background: `linear-gradient(135deg, ${C.gold}, ${C.goldL})`,
            border: "none", borderRadius: 14, color: "#1A140F", fontSize: 16,
            fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
            boxShadow: "0 8px 24px rgba(175,139,82,0.28)",
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
function ProgressView({ chapters, quizScores }) {
  const topics = chapters.filter(c => c.quiz);
  const totalQ = topics.reduce((s, c) => s + c.quiz.length, 0);
  const totalCorrect = Object.values(quizScores).reduce((s, v) => s + v, 0);
  const overallPct = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;

  const readiness = overallPct >= 90 ? { label: "Test Ready!", color: C.emerald, emoji: "🏆" }
    : overallPct >= 70 ? { label: "Almost There", color: C.amber, emoji: "📈" }
    : overallPct >= 40 ? { label: "Building Up", color: C.sky, emoji: "📚" }
    : { label: "Getting Started", color: C.muted, emoji: "�️" };

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
function HomeView({ chapters, onOpenChapter, onStartTest, onProgress, quizScores }) {
  const totalQuizChapters = chapters.filter(c => c.quiz).length;
  const passedChapters = chapters.filter(
    c => c.quiz && quizScores[c.id] && Math.round((quizScores[c.id] / c.quiz.length) * 100) >= 80
  ).length;
  const totalQ = chapters.filter(c => c.quiz).reduce((s, c) => s + c.quiz.length, 0);
  const totalCorrect = Object.values(quizScores).reduce((s, v) => s + v, 0);
  const overallPct = totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0;

  return (
    <div className="anim-fade-in" style={{ padding: "20px 18px" }}>
      {/* Hero */}
      <div style={{
        background: "radial-gradient(circle at top, rgba(209,177,122,0.10) 0%, rgba(29,26,23,0.98) 34%, #141210 100%)",
        borderRadius: 26, padding: "30px 24px 26px", marginBottom: 22,
        position: "relative", overflow: "hidden",
        border: `1px solid ${C.border}`,
        boxShadow: "0 22px 54px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.03)",
      }}>
        <div style={{
          position: "absolute",
          top: 14,
          right: 14,
          padding: "4px 8px",
          borderRadius: 999,
          border: `1px solid ${C.border}`,
          background: "rgba(0,0,0,0.32)",
          color: C.goldL,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 0.5,
          lineHeight: 1,
          zIndex: 2,
        }}>
          V. {APP_VERSION}
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ marginBottom: 18, display: "flex", justifyContent: "center" }}>
            <img
              src={LOGO_SRC}
              alt="CIMRA"
              style={{
                width: 130,
                height: 130,
                objectFit: "contain",
                filter: "drop-shadow(0 4px 18px rgba(0,0,0,0.8))",
                borderRadius: 12,
              }}
            />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: C.text, margin: "0 0 6px", letterSpacing: -0.5, lineHeight: 1.18, textShadow: "0 2px 12px rgba(0,0,0,0.75)", fontFamily: TITLE_FONT }}>
            Cayman Islands<br/>Motorcycle Rider Handbook
          </h1>
          <p style={{ color: C.goldL, fontSize: 12, margin: "0 0 20px", lineHeight: 1.5, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase" }}>
            Official CIMRA rider handbook in partnership with Cayman Custom Cycles
          </p>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 0, background: C.bg, borderRadius: 14, overflow: "hidden", border: `1px solid ${C.border}` }}>
            {[
              { n: chapters.length, l: "Chapters", c: C.goldL },
              { n: totalQ, l: "Questions", c: C.muted },
              { n: `${passedChapters}/${totalQuizChapters}`, l: "Passed", c: C.gold },
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
        {chapters.map((ch, i) => {
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
          background: "linear-gradient(135deg, #25201B, #171411)",
          border: `1px solid ${C.gold}66`, borderRadius: 18,
          color: C.text, cursor: "pointer", fontFamily: "inherit",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 12px 28px rgba(0,0,0,0.28)",
          transition: "transform 0.15s, box-shadow 0.15s",
        }}
        onMouseDown={e => { e.currentTarget.style.transform = "scale(0.98)"; }}
        onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
        onTouchStart={e => { e.currentTarget.style.transform = "scale(0.98)"; }}
        onTouchEnd={e => { e.currentTarget.style.transform = "scale(1)"; }}
      >
        <div style={{ textAlign: "left" }}>
          <p style={{ fontSize: 16, fontWeight: 800, margin: 0, letterSpacing: -0.3, fontFamily: TITLE_FONT }}>Full Practice Test</p>
          <p style={{ fontSize: 12, color: C.muted, margin: 0, marginTop: 2 }}>50 random questions · all chapters</p>
        </div>
        <Award size={28} color={C.goldL} />
      </button>

      <p style={{ color: C.border2, fontSize: 11, textAlign: "center", marginTop: 24, lineHeight: 1.5 }}>
        Cayman Custom Cycles × CIMRA<br/>Grand Cayman
      </p>
      <div style={{ height: 16 }} />
    </div>
  );
}

// ─── WELCOME VIEW ─────────────────────────────────────────────────────
function WelcomeView({ onEnter }) {
  return (
    <div className="anim-welcome-in" style={{ minHeight: "100dvh", padding: "28px 20px 40px", display: "flex", alignItems: "center" }}>
      <div style={{
        width: "100%",
        background: "radial-gradient(circle at top, rgba(209,177,122,0.14) 0%, rgba(29,26,23,0.98) 36%, #141210 100%)",
        borderRadius: 28,
        padding: "34px 24px 28px",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 24px 56px rgba(0,0,0,0.32)",
        textAlign: "center",
      }}>
        <div style={{
          position: "absolute",
          top: 14,
          right: 14,
          padding: "4px 8px",
          borderRadius: 999,
          border: `1px solid ${C.border}`,
          background: "rgba(0,0,0,0.32)",
          color: C.goldL,
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 0.5,
          lineHeight: 1,
          zIndex: 2,
        }}>
          V. {APP_VERSION}
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <img
            src={LOGO_SRC}
            alt="CIMRA"
            style={{
              width: 148,
              height: 148,
              objectFit: "contain",
              filter: "drop-shadow(0 6px 22px rgba(0,0,0,0.82))",
              borderRadius: 14,
            }}
          />
        </div>

        <h1 style={{
          fontSize: 28,
          fontWeight: 700,
          color: C.text,
          margin: "0 0 8px",
          letterSpacing: -0.6,
          lineHeight: 1.14,
          textShadow: "0 2px 12px rgba(0,0,0,0.75)",
          fontFamily: TITLE_FONT,
        }}>
          Welcome to the<br />CIMRA Rider Handbook
        </h1>

        <p style={{ color: C.goldL, fontSize: 12, margin: "0 0 18px", lineHeight: 1.5, fontWeight: 700, letterSpacing: 0.8, textTransform: "uppercase" }}>
          Cayman Islands Motorcycle Rider Guide
        </p>

        <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.7, margin: "0 0 12px" }}>
          This handbook brings together the key rules, riding principles, and practice questions to help riders prepare for safer riding and the written test.
        </p>
        <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.7, margin: "0 0 26px" }}>
          Use it to study the chapters, check your progress, and open the offline version for quick access on your phone.
        </p>

        <button
          onClick={onEnter}
          style={{
            width: "100%",
            padding: "16px 18px",
            background: `linear-gradient(135deg, ${C.gold}, ${C.goldL})`,
            border: "none",
            borderRadius: 16,
            color: "#1A140F",
            cursor: "pointer",
            fontSize: 16,
            fontWeight: 800,
            fontFamily: "inherit",
            boxShadow: "0 12px 28px rgba(175,139,82,0.28)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseDown={e => { e.currentTarget.style.transform = "scale(0.98)"; }}
          onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
          onTouchStart={e => { e.currentTarget.style.transform = "scale(0.98)"; }}
          onTouchEnd={e => { e.currentTarget.style.transform = "scale(1)"; }}
        >
          Enter Handbook
        </button>
      </div>
    </div>
  );
}

// ─── CHAPTERS LIST ────────────────────────────────────────────────────
function ChaptersListView({ chapters, onOpenChapter, quizScores }) {
  return (
    <div className="anim-slide-in-up" style={{ padding: "24px 18px" }}>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4, letterSpacing: -0.5 }}>Chapters</h2>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 22 }}>Study all {chapters.length} chapters to prepare for your test</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {chapters.map((ch, i) => {
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
    setUrl(getShareUrl("/download.html"));

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
      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 4, letterSpacing: -0.5 }}>Scan to Download on Mobile</h2>
      <p style={{ color: C.muted, fontSize: 13, marginBottom: 28, lineHeight: 1.6, maxWidth: 260 }}>
        Scan this QR code with your phone to open the handbook download page on any device on the same Wi-Fi network.
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
            <div style={{ flex: 1, textAlign: "left", overflow: "hidden" }}>
              <p style={{ color: C.text, fontSize: 13, fontWeight: 700, margin: 0 }}>
                CIMRA Handbook
              </p>
              <p style={{ color: C.dim, fontSize: 11, margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {url}
              </p>
            </div>
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

          <a href={url}
            target="_blank"
            rel="noreferrer"
            style={{
              width: "100%", maxWidth: 320, marginBottom: 18,
              textDecoration: "none", textAlign: "center",
              padding: "12px 14px", borderRadius: 12,
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldL})`,
              color: "#04111F", fontWeight: 800, fontSize: 14,
              boxShadow: "0 10px 24px rgba(201,168,76,0.28)",
            }}>
            Download for Offline Use
          </a>
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
                  background: `linear-gradient(135deg, ${C.gold}, ${C.goldL})`,
                  color: "#1A140F", fontWeight: 800, fontSize: 14, fontFamily: "inherit",
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
function BottomNav({ activeTab, onChange, showBack = false, onBack }) {
  const tabs = [
    ...(showBack ? [{ id: "back", Icon: ChevronLeft, label: "Back" }] : []),
    { id: "home",     Icon: Home,       label: "Home" },
    { id: "chapters", Icon: BookOpen,   label: "Study" },
    { id: "test",     Icon: Award,      label: "Test" },
    { id: "progress", Icon: TrendingUp, label: "Progress" },
    { id: "scan",     Icon: QrCode,     label: "Share" },
  ];
  return (
    <nav style={{
      position: "fixed", bottom: 10, left: "50%", transform: "translateX(-50%)",
      width: "calc(100% - 16px)", maxWidth: 414,
      background: "rgba(16,16,16,0.92)", backdropFilter: "blur(18px)",
      border: `1px solid ${C.border}`,
      borderRadius: 20,
      display: "flex", padding: "8px 4px calc(8px + env(safe-area-inset-bottom, 0px))",
      zIndex: 100,
      boxShadow: "0 20px 40px rgba(0,0,0,0.30)",
    }}>
      {tabs.map(({ id, Icon: Ic, label }) => {
        const active = id !== "back" && activeTab === id;
        return (
          <button key={id} onClick={() => (id === "back" ? onBack?.() : onChange(id))}
            style={{
              flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
              gap: 4, background: "none", border: "none", cursor: "pointer",
              padding: "6px 0", fontFamily: "inherit", position: "relative",
            }}>
            <div style={{
              width: 34, height: 34, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center",
              background: active ? `linear-gradient(135deg, ${C.gold}22, ${C.gold}10)` : "transparent",
              border: active ? `1px solid ${C.gold}44` : "1px solid transparent",
              transition: "all 0.24s ease",
              transform: active ? "translateY(-1px)" : "translateY(0)",
            }}>
              <Ic size={18} color={active ? C.goldL : C.dim} strokeWidth={active ? 2.3 : 2} />
            </div>
            <span style={{ fontSize: 10, color: active ? C.text : C.dim, fontWeight: active ? 700 : 500, letterSpacing: 0.2 }}>
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
  const [chapters, setChapters] = useState(CHAPTERS);
  const [showWelcome, setShowWelcome] = useState(true);
  const [tab, setTab] = useState("home");
  const [chapterIdx, setChapterIdx] = useState(null);
  const [inQuiz, setInQuiz] = useState(false);
  const [quizScores, setQuizScores] = useState(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(window.localStorage.getItem("cayman-handbook-progress-v1") || "{}");
    } catch {
      return {};
    }
  });
  const prevTab = useRef("home");
  const historyReady = useRef(false);
  const isApplyingHistory = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("cayman-handbook-progress-v1", JSON.stringify(quizScores));
    }
  }, [quizScores]);

  useEffect(() => {
    return subscribeToLiveHandbook(CHAPTERS, setChapters);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const historyState = normalizeNavigationState(window.history.state?.appNavigation);

    if (historyState) {
      isApplyingHistory.current = true;
      setShowWelcome(historyState.showWelcome);
      setTab(historyState.tab);
      setChapterIdx(historyState.chapterIdx);
      setInQuiz(historyState.inQuiz);
    } else {
      window.history.replaceState(
        { appNavigation: createNavigationState(true, "home", null, false) },
        ""
      );
    }

    historyReady.current = true;

    const handlePopState = (event) => {
      const nextState = normalizeNavigationState(event.state?.appNavigation)
        || createNavigationState(true, "home", null, false);

      isApplyingHistory.current = true;
      setShowWelcome(nextState.showWelcome);
      setTab(nextState.tab);
      setChapterIdx(nextState.chapterIdx);
      setInQuiz(nextState.inQuiz);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !historyReady.current) return;

    const nextState = createNavigationState(showWelcome, tab, chapterIdx, inQuiz);
    const currentState = normalizeNavigationState(window.history.state?.appNavigation);

    if (navigationStatesMatch(currentState, nextState)) {
      isApplyingHistory.current = false;
      return;
    }

    if (isApplyingHistory.current) {
      window.history.replaceState({ appNavigation: nextState }, "");
      isApplyingHistory.current = false;
      return;
    }

    window.history.pushState({ appNavigation: nextState }, "");
  }, [showWelcome, tab, chapterIdx, inQuiz]);

  const handleTabChange = (t) => {
    if (t !== tab) { prevTab.current = tab; setTab(t); setChapterIdx(null); setInQuiz(false); }
  };

  const goBack = () => {
    if (typeof window !== "undefined" && historyReady.current) {
      window.history.back();
      return;
    }

    if (showQuiz) {
      setInQuiz(false);
      return;
    }
    if (showChapterDetail) {
      setChapterIdx(null);
      return;
    }
    if (!showWelcome) {
      setShowWelcome(true);
    }
  };

  const handleOpenChapter = (i) => {
    setChapterIdx(i);
    setInQuiz(false);
    if (tab === "home") setTab("chapters");
  };

  const handleQuizComplete = (chId, score) => {
    setQuizScores(prev => ({ ...prev, [chId]: Math.max(prev[chId] || 0, score) }));
  };

  const handleResetProgress = () => {
    const confirmed = typeof window === "undefined" || window.confirm("Clear all saved quiz progress for testing?");
    if (!confirmed) return;
    setQuizScores({});
    setChapterIdx(null);
    setInQuiz(false);
    setTab("home");
  };

  const chapter = chapterIdx !== null ? chapters[chapterIdx] : null;

  const showWelcomeScreen = showWelcome;
  const showChapterDetail = tab === "chapters" && chapter && !inQuiz;
  const showQuiz = tab === "chapters" && chapter && inQuiz;
  const showTest = tab === "test";
  const showProgress = tab === "progress";
  const showScan = tab === "scan";
  const showChaptersList = tab === "chapters" && !chapter;
  const showHome = !showWelcomeScreen && tab === "home" && !chapter;
  const showBottomBack = !showWelcomeScreen && !showHome;

  return (
    <div style={{
      background: "linear-gradient(180deg, #100F0D 0%, #171411 100%)", minHeight: "100dvh", maxWidth: 430,
      margin: "0 auto", position: "relative", overflowX: "hidden",
      boxShadow: "0 24px 60px rgba(0,0,0,0.30)",
    }}>
      <div style={{ height: "env(safe-area-inset-top, 0px)" }} />

      <main style={{
        overflowY: "auto",
        paddingBottom: "calc(88px + env(safe-area-inset-bottom, 0px))",
        minHeight: "100dvh",
      }}>
        <div key={`${showWelcomeScreen ? "welcome" : tab}-${chapterIdx ?? "root"}-${inQuiz ? "quiz" : "view"}`} className="page-transition">
          {showWelcomeScreen && (
            <WelcomeView onEnter={() => setShowWelcome(false)} />
          )}
          {showHome && (
            <HomeView
              chapters={chapters}
              quizScores={quizScores}
              onOpenChapter={handleOpenChapter}
              onStartTest={() => handleTabChange("test")}
              onProgress={() => handleTabChange("progress")}
              onScan={() => handleTabChange("scan")}
              onResetProgress={handleResetProgress}
            />
          )}
          {showChaptersList && (
            <ChaptersListView chapters={chapters} quizScores={quizScores} onOpenChapter={handleOpenChapter} />
          )}
          {showChapterDetail && (
            <ChapterView
              key={`ch-${chapterIdx}`}
              chapter={chapter}
              onQuiz={() => setInQuiz(true)}
              onBack={goBack}
            />
          )}
          {showQuiz && (
            <QuizView
              key={`quiz-${chapterIdx}`}
              quiz={chapter.quiz}
              chapterTitle={chapter.title}
              chapterColor={chapter.color}
              onBack={goBack}
              onComplete={(score) => handleQuizComplete(chapter.id, score)}
            />
          )}
          {showTest && (
            <FullTestView key="fulltest" chapters={chapters} onBack={goBack} />
          )}
          {showProgress && (
            <ProgressView chapters={chapters} quizScores={quizScores} />
          )}
          {showScan && (
            <QRView />
          )}
        </div>
      </main>

      {!showWelcomeScreen && (
        <BottomNav
          activeTab={tab}
          onChange={handleTabChange}
          showBack={showBottomBack}
          onBack={goBack}
        />
      )}
    </div>
  );
}
