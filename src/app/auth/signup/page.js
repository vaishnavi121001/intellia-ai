"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUpUser } from "@/lib/supabase";

const GRADES = [
  "1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade",
  "6th Grade", "7th Grade", "8th Grade", "9th Grade", "10th Grade",
  "11th Grade", "12th Grade", "Undergraduate", "Graduate",
];

const SUBJECTS = [
  { name: "Mathematics", emoji: "📐" },
  { name: "Chemistry", emoji: "⚗️" },
  { name: "Biology", emoji: "🧬" },
  { name: "Physics", emoji: "⚡" },
  { name: "Artificial Intelligence", emoji: "🤖" },
  { name: "Engineering", emoji: "⚙️" },
  { name: "English", emoji: "📖" },
  { name: "Computer Science", emoji: "💻" },
];

<style jsx global>{`
  .logo-animate {
    animation: circular-3d 6s linear infinite;
  }

  @keyframes circular-3d {
    0% { transform: rotateY(0deg) rotateZ(0deg); }
    25% { transform: rotateY(20deg) rotateZ(5deg); }
    50% { transform: rotateY(0deg) rotateZ(0deg); }
    75% { transform: rotateY(-20deg) rotateZ(-5deg); }
    100% { transform: rotateY(0deg) rotateZ(0deg); }
  }
  
  @keyframes float { 
    0% { transform: translateY(0px) rotate(-2deg); } 
    50% { transform: translateY(-20px) rotate(2deg); } 
    100% { transform: translateY(0px) rotate(-2deg); } 
  }

  @keyframes logo-float {
    0% { transform: translateY(0px) rotateY(0deg); }
    50% { transform: translateY(-10px) rotateY(10deg); }
    100% { transform: translateY(0px) rotateY(0deg); }
  }
  
  @keyframes float { 
    0% { transform: translateY(0px) rotate(-2deg); } 
    50% { transform: translateY(-20px) rotate(2deg); } 
    100% { transform: translateY(0px) rotate(-2deg); } 
  }
    @keyframes logo-float {
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(2deg); }
  100% { transform: translateY(0px) rotate(0deg); }
}

.logo-animate {
  animation: logo-float 3s ease-in-out infinite;
  display: inline-block; /* Animation ke liye zaruri hai */
}
`}</style>
export default function SignUpPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    grade: "",
    subjects: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSubject = (subjectName) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subjectName)
        ? prev.subjects.filter((s) => s !== subjectName)
        : [...prev.subjects, subjectName],
    }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.name || !formData.email || !formData.password || !formData.grade) {
      setError("Please fill all fields");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (formData.subjects.length === 0) {
      setError("Please select at least one subject");
      setLoading(false);
      return;
    }

    try {
      const { error: signUpError } = await signUpUser(
        formData.email, formData.password, formData.name, formData.grade, formData.subjects
      );

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      localStorage.setItem("user", JSON.stringify({
        name: formData.name, email: formData.email, grade: formData.grade, subjects: formData.subjects,
      }));

      router.push("/auth/signin");
    } catch (err) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

 

return (
    <div
 style={{
  minHeight: "100dvh",
  width: "100%",
  background: "#030306",
  backgroundImage:
    "radial-gradient(circle at 10% 20%, rgba(79, 70, 225, 0.14) 0%, transparent 45%), radial-gradient(circle at 90% 80%, rgba(6, 182, 212, 0.12) 0%, transparent 45%)",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  overflowY: "auto",
  overflowX: "hidden",
  
  boxSizing: "border-box",
}}>
      
     <style dangerouslySetInnerHTML={{ __html: `
  .glass-panel-main { 
    background: rgba(205, 207, 232, 0.7); 
    backdrop-filter: blur(35px); 
    border: 1px solid rgba(255, 255, 255, 0.3); 
    box-shadow: 0 35px 80px rgba(0, 0, 0, 0.2); 
  }
  .form-input-field { 
    background: rgba(255, 255, 255, 0.6) !important; 
    border: 1px solid rgba(0, 0, 0, 0.1) !important; 
    color: #000 !important; /* Text Black */
    padding: 14px 16px; 
    border-radius: 14px; 
    width: 100%; 
    outline: none; 
  }
  .form-input-field::placeholder { color: #555; }
  .action-button-core { 
    background: linear-gradient(135deg, #4f46e5 0%, #292334 100%) !important; 
    color: #fff !important; 
    border: none; 
    border-radius: 14px; 
    padding: 15px; 
    font-weight: 700; 
    cursor: pointer; 
  }
    .signup-card{
  width:100%;
}

.subjects-grid{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:8px;
}

.password-row{
  display:flex;
  gap:12px;
}

@media (max-width:768px){

  .signup-card{
    border-radius:20px !important;
    padding:24px !important;
  }

  .subjects-grid{
    grid-template-columns:repeat(2,1fr) !important;
  }

  .password-row{
    flex-direction:column !important;
  }

  .password-row input{
    width:100% !important;
  }
}
`}} />

<div
  className="glass-panel-main signup-card"
  style={{
    width: "100%",
    maxWidth: "600px",
    borderRadius: "32px",
    padding: "clamp(20px,4vw,50px)",
    margin: "auto 0",
    boxSizing: "border-box",
  }}
>
  <div style={{ marginBottom: "30px", textAlign: "center" }}>

    <img 
  src="/Intellia-ai.png" 
  alt="Intellia AI" 
  className="logo-animate"
  style={{ 
    height: "45px", 
    marginBottom: "10px", 
    display: "inline-block" 
  }} 
/>
   
    <h3 style={{ fontSize: "28px", fontWeight: "900", color: "#080808", margin: "0 0 8px 0", textAlign: "left" }}>
      Create your account
    </h3>
    <p style={{ color: "#475569", fontSize: "14px", margin: 0,textAlign: "left" }}>
      Initialize your learning architecture and start your journey.
    </p>
  </div>
  

        <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <input className="form-input-field" type="text" name="name" placeholder="Full Name" onChange={handleInputChange} />
          <input className="form-input-field" type="email" name="email" placeholder="Email Address" onChange={handleInputChange} />
          
          <select name="grade" onChange={handleInputChange} className="form-input-field">
            <option value="">Select Grade Level</option>
            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
          </select>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
            {SUBJECTS.map((s) => (
              <button key={s.name} type="button" onClick={() => toggleSubject(s.name)} style={{
                background: formData.subjects.includes(s.name) ? "#141418" : "rgba(246, 242, 242, 0.03)",
                border: "1px solid rgba(255,255,255,0.05)", borderRadius: "10px", padding: "10px", cursor: "pointer", color: "#160f0f"
              }}>
                {s.icon} <span style={{fontSize: '15px', display: 'block'}}>{s.name.split(" ")[0]}</span>
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <input className="form-input-field" type="password" name="password" placeholder="Password" onChange={handleInputChange} />
            <input className="form-input-field" type="password" name="confirmPassword" placeholder="Confirm" onChange={handleInputChange} />
          </div>

          <button type="submit" className="action-button-core">Create Account</button>
        </form>

        <p style={{ textAlign: "center", color: "#0c0d0e", marginTop: "20px", fontSize: "15px" }}>
          Already have an account? <a href="/auth/signin" style={{ color: "#1e32c6" }}>Sign In</a>
        </p>
      </div>
    </div>
  );
}