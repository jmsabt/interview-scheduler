import React, { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Users,
  Calendar,
  Clock,
  UserCheck,
  Edit3,
  RotateCcw,
  RefreshCcw, // Added for clear all data button
} from "lucide-react";

import CsvImport from "./CsvImport"; // Assuming CsvImport.jsx is in the same directory

const App = () => {
  // State management
  const [currentView, setCurrentView] = useState("interviewer");
  const [interviewerData, setInterviewerData] = useState({
    availability: {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
    },
  });
  const [applicants, setApplicants] = useState([]);
  const [matches, setMatches] = useState([]);
  const [unmatched, setUnmatched] = useState([]);
  const [scheduleCapacity, setScheduleCapacity] = useState(1);
  const [scheduleDuration, setScheduleDuration] = useState(15);
  const [editingApplicant, setEditingApplicant] = useState(null);

  const [currentApplicant, setCurrentApplicant] = useState({
    name: "",
    availability: {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
    },
  });

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = [];
  for (let hour = 8; hour < 22; hour++) {
    timeSlots.push(`${hour.toString().padStart(2, "0")}:00`);
    timeSlots.push(`${hour.toString().padStart(2, "0")}:30`);
  }

  // Local storage keys
  const STORAGE_KEYS = {
    interviewer: "interview_scheduler_interviewer",
    applicants: "interview_scheduler_applicants",
  };

  // Handle applicants imported from CSV
  const handleCsvImport = (importedApplicants) => {
    // Filter out duplicates if an applicant with the same name already exists
    const uniqueNewApplicants = importedApplicants.filter(
      (newApp) =>
        !applicants.some((existingApp) => existingApp.name === newApp.name)
    );
    setApplicants((prev) => [...prev, ...uniqueNewApplicants]);
    // You might want to provide a message to the user about duplicates if any
    if (uniqueNewApplicants.length < importedApplicants.length) {
      console.warn(
        "Some applicants from CSV were duplicates and were not added."
      );
    }
  };

  // --- LOCAL STORAGE EFFECTS ---

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedInterviewer = localStorage.getItem(STORAGE_KEYS.interviewer);
    const savedApplicants = localStorage.getItem(STORAGE_KEYS.applicants);

    if (savedInterviewer) {
      try {
        setInterviewerData(JSON.parse(savedInterviewer));
      } catch (e) {
        console.error("Failed to parse interviewer data from localStorage:", e);
      }
    }

    if (savedApplicants) {
      try {
        setApplicants(JSON.parse(savedApplicants));
      } catch (e) {
        console.error("Failed to parse applicants data from localStorage:", e);
      }
    }
  }, []);

  // Save interviewer data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.interviewer,
      JSON.stringify(interviewerData)
    );
  }, [interviewerData]);

  // Save applicants data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.applicants, JSON.stringify(applicants));
  }, [applicants]);

  // --- UTILITY COMPONENTS AND FUNCTIONS ---

  // Time slot input component for setting availability
  const TimeSlotInput = ({ day, slots, onSlotsChange }) => {
    const addSlot = () => {
      onSlotsChange(day, [...slots, { start: "09:00", end: "09:30" }]);
    };

    const removeSlot = (index) => {
      const newSlots = slots.filter((_, i) => i !== index);
      onSlotsChange(day, newSlots);
    };

    const updateSlot = (index, field, value) => {
      const newSlots = [...slots];
      newSlots[index][field] = value;
      onSlotsChange(day, newSlots);
    };

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-blue-100">{day}</h4>
          <button
            onClick={addSlot}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-500/30 hover:bg-blue-500/50 rounded-lg backdrop-blur-sm border border-blue-400/30 text-blue-100 transition-all"
          >
            <Plus size={12} />
            Add Time
          </button>
        </div>
        {slots.map((slot, index) => (
          <div
            key={index}
            className="flex items-center gap-2 p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20"
          >
            <select
              value={slot.start}
              onChange={(e) => updateSlot(index, "start", e.target.value)}
              className="px-2 py-1 rounded bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {timeSlots.map((time) => {
                const [hours, minutes] = time.split(":").map(Number);
                const displayTime =
                  hours === 12
                    ? `12:${minutes.toString().padStart(2, "0")} PM`
                    : hours > 12
                    ? `${hours - 12}:${minutes.toString().padStart(2, "0")} PM`
                    : `${hours}:${minutes.toString().padStart(2, "0")} AM`;
                return (
                  <option key={time} value={time} className="bg-blue-900">
                    {displayTime}
                  </option>
                );
              })}
            </select>
            <span className="text-blue-100">to</span>
            <select
              value={slot.end}
              onChange={(e) => updateSlot(index, "end", e.target.value)}
              className="px-2 py-1 rounded bg-white/20 backdrop-blur-sm border border-white/30 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {timeSlots.map((time) => {
                const [hours, minutes] = time.split(":").map(Number);
                const displayTime =
                  hours === 12
                    ? `12:${minutes.toString().padStart(2, "0")} PM`
                    : hours > 12
                    ? `${hours - 12}:${minutes.toString().padStart(2, "0")} PM`
                    : `${hours}:${minutes.toString().padStart(2, "0")} AM`;
                return (
                  <option key={time} value={time} className="bg-blue-900">
                    {displayTime}
                  </option>
                );
              })}
            </select>
            <button
              onClick={() => removeSlot(index)}
              className="p-1 text-red-300 hover:text-red-200 hover:bg-red-500/20 rounded transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {slots.length === 0 && (
          <div className="p-3 text-center text-blue-200/70 bg-white/5 rounded-lg border border-white/10">
            No availability set
          </div>
        )}
      </div>
    );
  };

  // Handle interviewer availability changes
  const handleInterviewerAvailabilityChange = (day, slots) => {
    setInterviewerData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: slots,
      },
    }));
  };

  // Handle applicant availability changes (for add/edit forms)
  const handleApplicantAvailabilityChange = (day, slots) => {
    if (editingApplicant) {
      setEditingApplicant((prev) => ({
        ...prev,
        availability: {
          ...prev.availability,
          [day]: slots,
        },
      }));
    } else {
      setCurrentApplicant((prev) => ({
        ...prev,
        availability: {
          ...prev.availability,
          [day]: slots,
        },
      }));
    }
  };

  // Add a new applicant
  const addApplicant = () => {
    if (!currentApplicant.name.trim()) return;

    setApplicants((prev) => [...prev, { ...currentApplicant, id: Date.now() }]);
    setCurrentApplicant({
      name: "",
      availability: {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
      },
    });
  };

  // Set applicant to be edited
  const startEditingApplicant = (applicant) => {
    setEditingApplicant({ ...applicant });
  };

  // Save changes to an edited applicant
  const saveEditedApplicant = () => {
    if (!editingApplicant.name.trim()) return;

    setApplicants((prev) =>
      prev.map((applicant) =>
        applicant.id === editingApplicant.id ? editingApplicant : applicant
      )
    );
    setEditingApplicant(null);
  };

  // Cancel editing an applicant
  const cancelEditing = () => {
    setEditingApplicant(null);
  };

  // Delete an applicant
  const deleteApplicant = (id) => {
    setApplicants((prev) => prev.filter((applicant) => applicant.id !== id));
    if (editingApplicant && editingApplicant.id === id) {
      setEditingApplicant(null);
    }
  };

  // Clear all applicants
  const clearAllApplicants = () => {
    // Removed window.confirm as per instructions
    setApplicants([]);
    setEditingApplicant(null);
    setMatches([]);
    setUnmatched([]);
  };

  // Clear generated schedule results
  const clearSchedule = () => {
    setMatches([]);
    setUnmatched([]);
  };

  // --- NEW: Clear ALL data (localStorage and state) ---
  const clearAllData = () => {
    localStorage.removeItem(STORAGE_KEYS.interviewer);
    localStorage.removeItem(STORAGE_KEYS.applicants);

    setInterviewerData({
      availability: {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
      },
    });
    setApplicants([]);
    setMatches([]);
    setUnmatched([]);
    setScheduleCapacity(1);
    setScheduleDuration(15);
    setEditingApplicant(null);
    setCurrentApplicant({
      name: "",
      availability: {
        Monday: [],
        Tuesday: [],
        Wednesday: [],
        Thursday: [],
        Friday: [],
      },
    });
    setCurrentView("interviewer"); // Go back to interviewer setup
  };

  // Time conversion utilities
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  };

  // Generate interviewer time slots based on duration and capacity
  const generateTimeSlots = (
    capacity = scheduleCapacity,
    duration = scheduleDuration
  ) => {
    const slots = [];

    days.forEach((day) => {
      const daySlots = [];

      interviewerData.availability[day].forEach((period) => {
        const startMinutes = timeToMinutes(period.start);
        const endMinutes = timeToMinutes(period.end);

        for (let time = startMinutes; time < endMinutes; time += duration) {
          const slotStart = time;
          const slotEnd = time + duration;

          if (slotEnd <= endMinutes) {
            daySlots.push({
              start: minutesToTime(slotStart),
              end: minutesToTime(slotEnd),
              assigned: [], // Tracks applicants assigned to this slot
            });
          }
        }
      });

      if (daySlots.length > 0) {
        slots.push({ day, slots: daySlots });
      }
    });

    return slots;
  };

  // Check if an applicant is available for a given time slot
  const isApplicantAvailable = (applicant, day, slotStart, slotEnd) => {
    const slotStartMinutes = timeToMinutes(slotStart);
    const slotEndMinutes = timeToMinutes(slotEnd);

    return applicant.availability[day].some((period) => {
      const periodStart = timeToMinutes(period.start);
      const periodEnd = timeToMinutes(period.end);

      return periodStart <= slotStartMinutes && periodEnd >= slotEndMinutes;
    });
  };

  // Main function to generate interview matches
  const generateMatches = (
    capacity = scheduleCapacity,
    duration = scheduleDuration
  ) => {
    const timeSlots = generateTimeSlots(capacity, duration); // Get all potential interviewer slots
    const shuffledApplicants = [...applicants].sort(() => Math.random() - 0.5); // Randomize applicant order
    const assignedApplicants = new Set(); // Keep track of assigned applicants
    const newUnmatched = [];

    // Attempt to assign each applicant to an available slot
    shuffledApplicants.forEach((applicant) => {
      let assigned = false;

      // Iterate through days
      for (const dayData of timeSlots) {
        if (assigned) break; // Move to next applicant if assigned

        // Iterate through slots within the day
        for (const slot of dayData.slots) {
          if (assigned) break; // Move to next applicant if assigned

          // Check if slot has capacity and applicant is available
          if (
            slot.assigned.length < capacity &&
            isApplicantAvailable(applicant, dayData.day, slot.start, slot.end)
          ) {
            slot.assigned.push(applicant);
            assignedApplicants.add(applicant.id);
            assigned = true;
          }
        }
      }

      // If applicant was not assigned, add to unmatched list
      if (!assigned) {
        newUnmatched.push(applicant);
      }
    });

    return { matches: timeSlots, unmatched: newUnmatched };
  };

  // Handle schedule capacity change and regenerate schedule if needed
  const handleCapacityChange = (newCapacity) => {
    setScheduleCapacity(newCapacity);
    if (matches.length > 0 || unmatched.length > 0) {
      const { matches: newMatches, unmatched: newUnmatched } = generateMatches(
        newCapacity,
        scheduleDuration
      );
      setMatches(newMatches);
      setUnmatched(newUnmatched);
    }
  };

  // Handle schedule duration change and regenerate schedule if needed
  const handleDurationChange = (newDuration) => {
    setScheduleDuration(newDuration);
    if (matches.length > 0 || unmatched.length > 0) {
      const { matches: newMatches, unmatched: newUnmatched } = generateMatches(
        scheduleCapacity,
        newDuration
      );
      setMatches(newMatches);
      setUnmatched(newUnmatched);
    }
  };

  // Generate initial matches and switch to results view
  const initialGenerateMatches = () => {
    const { matches: newMatches, unmatched: newUnmatched } = generateMatches();
    setMatches(newMatches);
    setUnmatched(newUnmatched);
    setCurrentView("results");
  };

  // Format time for display (e.g., "09:00" to "9:00 AM")
  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    if (hours === 12) return `12:${minutes.toString().padStart(2, "0")} PM`;
    if (hours > 12)
      return `${hours - 12}:${minutes.toString().padStart(2, "0")} PM`;
    return `${hours}:${minutes.toString().padStart(2, "0")} AM`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-4 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <h1 className="text-4xl font-bold text-white mb-2">
            Interview Scheduler
          </h1>
          <p className="text-blue-200">
            Automatically match interviewer and applicant availability
          </p>
          {/* NEW: Clear All Data Button */}
          <button
            onClick={clearAllData}
            className="absolute top-0 right-0 flex items-center gap-1 px-3 py-2 text-sm bg-red-500/30 hover:bg-red-500/50 rounded-lg backdrop-blur-sm border border-red-400/30 text-red-100 transition-all"
          >
            <RefreshCcw size={16} />
            Clear All Data
          </button>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 mb-8 p-1 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
          {[
            { id: "interviewer", label: "Interviewer Setup", icon: Users },
            { id: "applicant", label: "Manage Applicants", icon: UserCheck },
            { id: "results", label: "Schedule Results", icon: Calendar },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setCurrentView(id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
                currentView === id
                  ? "bg-white/20 text-white border border-white/30"
                  : "text-blue-200 hover:bg-white/10"
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>

        {/* Interviewer Setup View */}
        {currentView === "interviewer" && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Clock size={24} />
                Interviewer Availability
              </h2>
              <p className="text-blue-200 mb-6">
                Set your weekly availability. Interview duration will be
                configured in the schedule results.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6">
                Weekly Availability
              </h3>
              <div className="space-y-6">
                {days.map((day) => (
                  <TimeSlotInput
                    key={day}
                    day={day}
                    slots={interviewerData.availability[day]}
                    onSlotsChange={handleInterviewerAvailabilityChange}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Applicant Management View */}
        {currentView === "applicant" && (
          <div className="space-y-6">
            {/* Add/Edit Applicant Form */}
            {/* NEW: CSV Import Component */}
            <CsvImport onApplicantsImported={handleCsvImport} />
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <UserCheck size={24} />
                {editingApplicant ? "Edit Applicant" : "Add New Applicant"}
              </h2>

              <div className="mb-6">
                <label className="block text-blue-100 text-sm font-medium mb-2">
                  Applicant Name
                </label>
                <input
                  type="text"
                  value={
                    editingApplicant
                      ? editingApplicant.name
                      : currentApplicant.name
                  }
                  onChange={(e) => {
                    if (editingApplicant) {
                      setEditingApplicant((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }));
                    } else {
                      setCurrentApplicant((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }));
                    }
                  }}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Enter applicant name"
                />
              </div>

              <h3 className="text-xl font-bold text-white mb-6">
                Weekly Availability
              </h3>
              <div className="space-y-6 mb-8">
                {days.map((day) => (
                  <TimeSlotInput
                    key={day}
                    day={day}
                    slots={
                      editingApplicant
                        ? editingApplicant.availability[day]
                        : currentApplicant.availability[day]
                    }
                    onSlotsChange={handleApplicantAvailabilityChange}
                  />
                ))}
              </div>

              <div className="flex gap-4">
                {editingApplicant ? (
                  <>
                    <button
                      onClick={saveEditedApplicant}
                      disabled={!editingApplicant.name.trim()}
                      className="flex-1 py-3 px-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="flex-1 py-3 px-6 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-all"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={addApplicant}
                    disabled={!currentApplicant.name.trim()}
                    className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all"
                  >
                    Add Applicant
                  </button>
                )}
              </div>
            </div>

            {/* Applicants List */}
            {applicants.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">
                    Added Applicants ({applicants.length})
                  </h3>
                  <button
                    onClick={clearAllApplicants}
                    className="px-4 py-2 text-red-300 hover:text-red-200 hover:bg-red-500/20 rounded-lg transition-all"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-2 mb-6">
                  {applicants.map((applicant) => (
                    <div
                      key={applicant.id}
                      className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                        editingApplicant && editingApplicant.id === applicant.id
                          ? "bg-blue-500/20 border border-blue-400/30"
                          : "bg-white/10"
                      }`}
                    >
                      <span className="text-white font-medium">
                        {applicant.name}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditingApplicant(applicant)}
                          className="p-2 text-blue-300 hover:text-blue-200 hover:bg-blue-500/20 rounded transition-all"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => deleteApplicant(applicant.id)}
                          className="p-2 text-red-300 hover:text-red-200 hover:bg-red-500/20 rounded transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={initialGenerateMatches}
                  disabled={applicants.length === 0}
                  className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all"
                >
                  Generate Schedule Matches
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results View */}
        {currentView === "results" && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Calendar size={24} />
                  Interview Schedule
                </h2>
                <button
                  onClick={clearSchedule}
                  className="flex items-center gap-2 px-4 py-2 text-blue-200 hover:text-blue-100 hover:bg-blue-500/20 rounded-lg transition-all"
                >
                  <RotateCcw size={16} />
                  Clear Schedule
                </button>
              </div>

              {/* Duration and Capacity Controls */}
              <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
                <div>
                  <label className="block text-blue-100 text-sm font-medium mb-3">
                    Interview Duration (minutes)
                  </label>
                  <div className="flex gap-2">
                    {[15, 30, 45, 60].map((duration) => (
                      <button
                        key={duration}
                        onClick={() => handleDurationChange(duration)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          scheduleDuration === duration
                            ? "bg-blue-600 text-white border border-blue-400"
                            : "bg-white/10 text-blue-200 hover:bg-white/20 border border-white/20"
                        }`}
                      >
                        {duration} min
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-blue-100 text-sm font-medium mb-3">
                    Number of Interviewers Available
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCapacityChange(1)}
                      className={`px-6 py-2 rounded-lg font-medium transition-all ${
                        scheduleCapacity === 1
                          ? "bg-blue-600 text-white border border-blue-400"
                          : "bg-white/10 text-blue-200 hover:bg-white/20 border border-white/20"
                      }`}
                    >
                      1 Interviewer
                    </button>
                    <button
                      onClick={() => handleCapacityChange(2)}
                      className={`px-6 py-2 rounded-lg font-medium transition-all ${
                        scheduleCapacity === 2
                          ? "bg-blue-600 text-white border border-blue-400"
                          : "bg-white/10 text-blue-200 hover:bg-white/20 border border-white/20"
                      }`}
                    >
                      2 Interviewers
                    </button>
                  </div>
                </div>
              </div>

              {matches.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-blue-200 mb-4">
                    No schedule generated yet.
                  </p>
                  <button
                    onClick={() => setCurrentView("applicant")}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all"
                  >
                    Manage Applicants First
                  </button>
                </div>
              ) : (
                <div className="space-y-8">
                  {matches.map(({ day, slots }) => (
                    <div key={day}>
                      <h3 className="text-xl font-bold text-white mb-4">
                        {day}
                      </h3>
                      <div className="bg-white/5 rounded-xl overflow-hidden border border-white/20">
                        <div className="grid grid-cols-2 bg-white/10 p-4 border-b border-white/20">
                          <div className="font-semibold text-blue-100">
                            Time Slot
                          </div>
                          <div className="font-semibold text-blue-100">
                            Assigned Applicant(s){" "}
                            {scheduleCapacity === 2 && "(Max 2)"}
                          </div>
                        </div>
                        {slots.map((slot, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-2 p-4 border-b border-white/10 last:border-b-0 hover:bg-white/5"
                          >
                            <div className="text-white font-mono">
                              {formatTime(slot.start)} - {formatTime(slot.end)}
                            </div>
                            <div className="text-blue-100">
                              {slot.assigned.length > 0 ? (
                                slot.assigned.map((a) => a.name).join(", ")
                              ) : (
                                <span className="text-blue-300/70">None</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Unmatched Applicants */}
            {unmatched.length > 0 && (
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">
                  Unmatched Applicants
                </h3>
                <div className="bg-white/5 rounded-xl overflow-hidden border border-white/20">
                  <div className="bg-white/10 p-4 border-b border-white/20">
                    <div className="font-semibold text-blue-100">
                      No Available Time Slots
                    </div>
                  </div>
                  {unmatched.map((applicant, index) => (
                    <div
                      key={index}
                      className="p-4 border-b border-white/10 last:border-b-0"
                    >
                      <span className="text-white">{applicant.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
