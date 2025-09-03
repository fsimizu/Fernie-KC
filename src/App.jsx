import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import React, { useEffect, useMemo, useRef, useState } from "react";
import { guestData } from "./guests";


export default function App() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef(null); 

  // Flatten once for simpler matching
  const flatGuests = useMemo(
    () =>
      guestData.flatMap((t) =>
        t.guests.map((g) => ({
          fullName: g.name,
          tableNumber: t.tableNumber,
          textNumber: t.textNumber,
          key: `${g.name}-${t.tableNumber}`,
        }))
      ),
    []
  );

  // Helper to do case-insensitive "contains" (any part of the name)
  const norm = (s) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");

  const matches = useMemo(() => {
    const q = norm(input.trim());
    if (!q) return [];
    return flatGuests.filter((g) => norm(g.fullName).includes(q));
  }, [flatGuests, input]);

  const wrapperRef = useRef(null);
  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const choose = (g) => {
    setInput(g.fullName);
    setOpen(false);
    setResult(`TABLE ${g.tableNumber} ${g.textNumber}`);
    inputRef.current.blur();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setResult("");

    if (input.trim() === "") {
      setResult("Please enter your name.");
      return;
    }

    const exact = flatGuests.find(
      (g) => norm(g.fullName) === norm(input.trim())
    );
    if (exact) {
      choose(exact);
      return;
    }

    if (matches.length === 1) {
      choose(matches[0]);
      return;
    }

    if (matches.length > 1) {
      setOpen(true);
      setResult("Multiple matches found — please select your full name.");
      return;
    }

    setResult("Guest not found");

    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const onKeyDown = (e) => {
    if (!open || matches.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((i) => (i + 1) % matches.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((i) => (i - 1 + matches.length) % matches.length);
    } else if (e.key === "Enter") {
      if (open && matches[highlight]) {
        e.preventDefault();
        choose(matches[highlight]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className='container'>
      
      <Box sx={{ minWidth: 275 }}>

          <form
            onSubmit={handleSubmit}
            style={{ 
              padding: '0px 20px 100px', 
              fontFamily: "sans-serif", 
              maxWidth: 520, 
              position: "relative",
              height: '60%',
            }}
            ref={wrapperRef}
          >
            <h1 className='font'
            style={{
              textAlign:'center',
              marginTop: 0
            }}
            >FIND YOUR TABLE</h1>

            <div style={{ position: "relative" }}>
              <TextField id="outlined-basic" label="Your name" variant="outlined"
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setResult("");
                  setOpen(true);
                  setHighlight(0);
                }}
                onFocus={() => input && setOpen(true)}
                onKeyDown={onKeyDown}
                autoComplete="off"
                sx={{
                  width: "100%",
                  "& .MuiInputBase-input": {
                    fontFamily: "Cormorant Garamond",
                    fontSize: '1.5rem'
                  },
                  "& .MuiInputLabel-root": {
                    fontFamily: "Cormorant Garamond",
                    fontSize: '1.5rem'
                  },
                  "& .MuiInputLabel-root.MuiInputLabel-shrink": {
                    transform: "translate(14px, -14px) scale(0.75)", 
                  },
                  "& .MuiOutlinedInput-root": {
                    "& legend": {
                      fontSize: "1rem",
                    },
                  },
                }}
              />


              {/* Autocomplete dropdown */}
              {open && matches.length > 0 && (
                <ul
                  role="listbox"
                  aria-label="Guest matches"
                  className='font'
                  style={{
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: "100%",
                    zIndex: 10,
                    background: "white",
                    border: "1px solid #ddd",
                    borderTop: "none",
                    maxHeight: 120,
                    overflowY: "auto",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                    borderBottomLeftRadius: 8,
                    borderBottomRightRadius: 8,
                  }}
                >
                  {matches.map((m, idx) => (
                    <li
                      key={m.key}
                      role="option"
                      aria-selected={idx === highlight}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => choose(m)}
                      onMouseEnter={() => setHighlight(idx)}
                      style={{
                        padding: "10px 12px",
                        cursor: "pointer",
                        background: idx === highlight ? "#f2f2f2" : "transparent",
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 8,
                        fontSize: '1.5rem'
                      }}
                    >
                      <span>{m.fullName}</span>
                      <span style={{ opacity: 0.7 }}>Table {m.tableNumber}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {result && <h3 
            className='font' 
            style={{ marginTop: 12, textAlign:'center', 
              fontSize: '1.5rem'
            }}
            >{result}
            </h3>}
          </form>
      </Box>
    </div>
  );
}
