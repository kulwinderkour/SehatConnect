import { EmergencyType } from '../types/emergency';

export const EMERGENCY_TYPES: EmergencyType[] = [
  {
    id: 'road_accident',
    title: 'Road Accident',
    icon: 'car-crash',
    emoji: '🚑',
    color: '#ef4444',
    description: 'Vehicle collision or road traffic accident',
    firstAidSteps: [
      {
        id: 'ra_1',
        step: 1,
        instruction: 'Ensure scene safety - check for ongoing danger',
        warning: 'Do not move severely injured person unless in immediate danger',
        audioKey: 'road_accident_step_1'
      },
      {
        id: 'ra_2',
        step: 2,
        instruction: 'Call emergency services immediately',
        audioKey: 'road_accident_step_2'
      },
      {
        id: 'ra_3',
        step: 3,
        instruction: 'Check for consciousness and breathing',
        audioKey: 'road_accident_step_3'
      },
      {
        id: 'ra_4',
        step: 4,
        instruction: 'Control bleeding with direct pressure if safe to do so',
        audioKey: 'road_accident_step_4'
      },
      {
        id: 'ra_5',
        step: 5,
        instruction: 'Keep person warm and still until help arrives',
        audioKey: 'road_accident_step_5'
      }
    ],
    specializedActions: [
      {
        id: 'ra_ambulance',
        label: 'Request Ambulance',
        action: 'call_ambulance',
        icon: 'ambulance',
        color: '#ef4444',
        priority: 'high'
      },
      {
        id: 'ra_trauma',
        label: 'Nearest Trauma Center',
        action: 'find_facility',
        icon: 'hospital',
        color: '#f59e0b',
        priority: 'high'
      }
    ],
    nearestFacilityType: 'trauma_center'
  },
  {
    id: 'chest_pain',
    title: 'Chest Pain / Heart Issue',
    icon: 'heart-pulse',
    emoji: '❤️',
    color: '#dc2626',
    description: 'Heart attack or severe chest pain',
    firstAidSteps: [
      {
        id: 'cp_1',
        step: 1,
        instruction: 'Call emergency services immediately',
        warning: 'Time is critical for heart attacks',
        audioKey: 'chest_pain_step_1'
      },
      {
        id: 'cp_2',
        step: 2,
        instruction: 'Help person sit in comfortable position',
        audioKey: 'chest_pain_step_2'
      },
      {
        id: 'cp_3',
        step: 3,
        instruction: 'Loosen tight clothing around neck and chest',
        audioKey: 'chest_pain_step_3'
      },
      {
        id: 'cp_4',
        step: 4,
        instruction: 'Give aspirin if person is conscious and not allergic',
        warning: 'Only if no aspirin allergy',
        audioKey: 'chest_pain_step_4'
      },
      {
        id: 'cp_5',
        step: 5,
        instruction: 'Be ready to perform CPR if person becomes unconscious',
        audioKey: 'chest_pain_step_5'
      }
    ],
    specializedActions: [
      {
        id: 'cp_ambulance',
        label: 'Emergency Ambulance',
        action: 'call_ambulance',
        icon: 'ambulance',
        color: '#dc2626',
        priority: 'high'
      },
      {
        id: 'cp_cardiologist',
        label: 'Call Cardiologist',
        action: 'call_specialist',
        icon: 'stethoscope',
        color: '#8b5cf6',
        priority: 'high'
      },
      {
        id: 'cp_cpr',
        label: 'CPR Guide',
        action: 'show_guide',
        icon: 'heart-handshake',
        color: '#f59e0b',
        priority: 'medium'
      }
    ],
    nearestFacilityType: 'hospital'
  },
  {
    id: 'snake_bite',
    title: 'Snake/Insect Bite',
    icon: 'bug',
    emoji: '🐍',
    color: '#059669',
    description: 'Venomous snake or insect bite',
    firstAidSteps: [
      {
        id: 'sb_1',
        step: 1,
        instruction: 'Keep the person calm and still',
        warning: 'Movement spreads venom faster',
        audioKey: 'snake_bite_step_1'
      },
      {
        id: 'sb_2',
        step: 2,
        instruction: 'Remove jewelry and tight clothing near bite',
        audioKey: 'snake_bite_step_2'
      },
      {
        id: 'sb_3',
        step: 3,
        instruction: 'Apply pressure bandage above bite (not tourniquet)',
        warning: 'Do not cut the wound or suck out venom',
        audioKey: 'snake_bite_step_3'
      },
      {
        id: 'sb_4',
        step: 4,
        instruction: 'Keep bitten area below heart level',
        audioKey: 'snake_bite_step_4'
      },
      {
        id: 'sb_5',
        step: 5,
        instruction: 'Get to hospital immediately for antivenom',
        audioKey: 'snake_bite_step_5'
      }
    ],
    specializedActions: [
      {
        id: 'sb_antivenom',
        label: 'Antivenom Center',
        action: 'find_facility',
        icon: 'flask',
        color: '#059669',
        priority: 'high'
      },
      {
        id: 'sb_ambulance',
        label: 'Emergency Transport',
        action: 'call_ambulance',
        icon: 'ambulance',
        color: '#ef4444',
        priority: 'high'
      }
    ],
    nearestFacilityType: 'poison_control'
  },
  {
    id: 'pregnancy_delivery',
    title: 'Pregnancy / Delivery',
    icon: 'baby',
    emoji: '🤰',
    color: '#ec4899',
    description: 'Emergency childbirth or pregnancy complications',
    firstAidSteps: [
      {
        id: 'pd_1',
        step: 1,
        instruction: 'Call emergency services and notify of childbirth',
        audioKey: 'pregnancy_step_1'
      },
      {
        id: 'pd_2',
        step: 2,
        instruction: 'Help mother find comfortable position',
        audioKey: 'pregnancy_step_2'
      },
      {
        id: 'pd_3',
        step: 3,
        instruction: 'Gather clean towels and warm blankets',
        audioKey: 'pregnancy_step_3'
      },
      {
        id: 'pd_4',
        step: 4,
        instruction: 'Do not try to delay or stop the birth',
        warning: 'Let nature take its course',
        audioKey: 'pregnancy_step_4'
      },
      {
        id: 'pd_5',
        step: 5,
        instruction: 'Support baby\'s head and shoulders as they emerge',
        audioKey: 'pregnancy_step_5'
      }
    ],
    specializedActions: [
      {
        id: 'pd_maternity',
        label: 'Maternity Hospital',
        action: 'find_facility',
        icon: 'hospital',
        color: '#ec4899',
        priority: 'high'
      },
      {
        id: 'pd_ambulance',
        label: 'Medical Transport',
        action: 'call_ambulance',
        icon: 'ambulance',
        color: '#ef4444',
        priority: 'high'
      },
      {
        id: 'pd_guide',
        label: 'Emergency Birth Guide',
        action: 'show_guide',
        icon: 'book-open',
        color: '#3b82f6',
        priority: 'medium'
      }
    ],
    nearestFacilityType: 'maternity'
  },
  {
    id: 'burns',
    title: 'Burns',
    icon: 'flame',
    emoji: '🔥',
    color: '#f97316',
    description: 'Severe burns or fire-related injuries',
    firstAidSteps: [
      {
        id: 'b_1',
        step: 1,
        instruction: 'Remove person from heat source if safe',
        warning: 'Ensure your own safety first',
        audioKey: 'burns_step_1'
      },
      {
        id: 'b_2',
        step: 2,
        instruction: 'Cool burn with cold running water for 10-20 minutes',
        audioKey: 'burns_step_2'
      },
      {
        id: 'b_3',
        step: 3,
        instruction: 'Remove jewelry and loose clothing from burned area',
        warning: 'Do not remove clothing stuck to burn',
        audioKey: 'burns_step_3'
      },
      {
        id: 'b_4',
        step: 4,
        instruction: 'Cover burn with clean, dry cloth',
        warning: 'Do not apply ice, butter, or ointments',
        audioKey: 'burns_step_4'
      },
      {
        id: 'b_5',
        step: 5,
        instruction: 'Seek immediate medical attention for severe burns',
        audioKey: 'burns_step_5'
      }
    ],
    specializedActions: [
      {
        id: 'b_hospital',
        label: 'Burn Treatment Center',
        action: 'find_facility',
        icon: 'hospital',
        color: '#f97316',
        priority: 'high'
      },
      {
        id: 'b_ambulance',
        label: 'Emergency Medical Care',
        action: 'call_ambulance',
        icon: 'ambulance',
        color: '#ef4444',
        priority: 'high'
      }
    ],
    nearestFacilityType: 'hospital'
  },
  {
    id: 'child_emergency',
    title: 'Child Emergency',
    icon: 'baby-carriage',
    emoji: '🧒',
    color: '#8b5cf6',
    description: 'Pediatric emergency or child in distress',
    firstAidSteps: [
      {
        id: 'ce_1',
        step: 1,
        instruction: 'Assess child\'s consciousness and breathing',
        audioKey: 'child_emergency_step_1'
      },
      {
        id: 'ce_2',
        step: 2,
        instruction: 'Call emergency services immediately',
        audioKey: 'child_emergency_step_2'
      },
      {
        id: 'ce_3',
        step: 3,
        instruction: 'Keep child calm and comfortable',
        audioKey: 'child_emergency_step_3'
      },
      {
        id: 'ce_4',
        step: 4,
        instruction: 'Note any symptoms or changes in condition',
        audioKey: 'child_emergency_step_4'
      },
      {
        id: 'ce_5',
        step: 5,
        instruction: 'Be prepared to perform child CPR if needed',
        audioKey: 'child_emergency_step_5'
      }
    ],
    specializedActions: [
      {
        id: 'ce_pediatric',
        label: 'Pediatric Hospital',
        action: 'find_facility',
        icon: 'hospital',
        color: '#8b5cf6',
        priority: 'high'
      },
      {
        id: 'ce_ambulance',
        label: 'Pediatric Ambulance',
        action: 'call_ambulance',
        icon: 'ambulance',
        color: '#ef4444',
        priority: 'high'
      },
      {
        id: 'ce_cpr',
        label: 'Child CPR Guide',
        action: 'show_guide',
        icon: 'heart-handshake',
        color: '#f59e0b',
        priority: 'medium'
      }
    ],
    nearestFacilityType: 'pediatric'
  },
  {
    id: 'other',
    title: 'Other',
    icon: 'help-circle',
    emoji: '❓',
    color: '#6b7280',
    description: 'Other medical emergency',
    firstAidSteps: [
      {
        id: 'o_1',
        step: 1,
        instruction: 'Assess the situation for immediate danger',
        audioKey: 'other_step_1'
      },
      {
        id: 'o_2',
        step: 2,
        instruction: 'Call emergency services and explain the situation',
        audioKey: 'other_step_2'
      },
      {
        id: 'o_3',
        step: 3,
        instruction: 'Follow basic first aid principles',
        audioKey: 'other_step_3'
      },
      {
        id: 'o_4',
        step: 4,
        instruction: 'Stay with the person until help arrives',
        audioKey: 'other_step_4'
      }
    ],
    specializedActions: [
      {
        id: 'o_ambulance',
        label: 'Emergency Services',
        action: 'call_ambulance',
        icon: 'ambulance',
        color: '#ef4444',
        priority: 'high'
      },
      {
        id: 'o_hospital',
        label: 'Nearest Hospital',
        action: 'find_facility',
        icon: 'hospital',
        color: '#3b82f6',
        priority: 'medium'
      }
    ],
    nearestFacilityType: 'hospital'
  }
];

// Emergency service contacts
export const EMERGENCY_CONTACTS = {
  ambulance: '108',
  police: '100',
  fire: '101',
  women_helpline: '1091',
  child_helpline: '1098',
  senior_citizen_helpline: '14567',
  poison_control: '9543356789'
};

// Audio prompts for different languages
export const AUDIO_PROMPTS = {
  en: {
    emergency_initiated: 'Emergency services have been contacted. Help is on the way.',
    follow_instructions: 'Please follow the first aid instructions shown on screen.',
    ambulance_dispatched: 'Ambulance has been dispatched to your location.',
    stay_calm: 'Please stay calm and keep the patient comfortable.'
  },
  hi: {
    emergency_initiated: 'आपातकालीन सेवाओं से संपर्क किया गया है। मदद आ रही है।',
    follow_instructions: 'कृपया स्क्रीन पर दिखाए गए प्राथमिक चिकित्सा निर्देशों का पालन करें।',
    ambulance_dispatched: 'एम्बुलेंस आपके स्थान पर भेज दी गई है।',
    stay_calm: 'कृपया शांत रहें और मरीज़ को आराम दें।'
  },
  pa: {
    emergency_initiated: 'ਐਮਰਜੈਂਸੀ ਸੇਵਾਵਾਂ ਨਾਲ ਸੰਪਰਕ ਕੀਤਾ ਗਿਆ ਹੈ। ਮਦਦ ਆ ਰਹੀ ਹੈ।',
    follow_instructions: 'ਕਿਰਪਾ ਕਰਕੇ ਸਕ੍ਰੀਨ ਤੇ ਦਿਖਾਏ ਗਏ ਫਰਸਟ ਏਡ ਨਿਰਦੇਸ਼ਾਂ ਦਾ ਪਾਲਣ ਕਰੋ।',
    ambulance_dispatched: 'ਐਂਬੂਲੈਂਸ ਤੁਹਾਡੇ ਸਥਾਨ ਤੇ ਭੇਜ ਦਿੱਤੀ ਗਈ ਹੈ।',
    stay_calm: 'ਕਿਰਪਾ ਕਰਕੇ ਸ਼ਾਂਤ ਰਹੋ ਅਤੇ ਮਰੀਜ਼ ਨੂੰ ਆਰਾਮ ਦਿਓ।'
  }
};