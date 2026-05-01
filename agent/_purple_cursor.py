#!/usr/bin/env python3
"""CursorEye AI Purple Cursor Overlay.
Shows a purple dot where the AI is clicking in the Worker window.
Does NOT move the user's real cursor."""

import tkinter as tk
import json
import os

POS_FILE = os.path.expanduser("~/.cursoreye/purple_cursor_pos.json")
BOUNDS_FILE = os.path.expanduser("~/.cursoreye/worker_bounds.json")


class PurpleCursor:
    def __init__(self):
        self.root = tk.Tk()
        self.root.overrideredirect(True)
        self.root.attributes("-topmost", True)
        try:
            self.root.attributes("-transparentcolor", "white")
        except tk.TclError:
            pass
        self.root.configure(bg="white")

        self.size = 28
        self.canvas = tk.Canvas(
            self.root,
            width=self.size,
            height=self.size,
            bg="white",
            highlightthickness=0,
        )
        self.canvas.pack()

        self.cursor_dot = self.canvas.create_oval(
            4,
            4,
            self.size - 4,
            self.size - 4,
            fill="#6c5ce7",
            outline="#a29bfe",
            width=2,
        )
        self.cursor_ring = self.canvas.create_oval(
            0,
            0,
            self.size,
            self.size,
            fill="",
            outline="#6c5ce7",
            width=1,
            dash=(2, 2),
        )
        self.click_flash = self.canvas.create_oval(
            2,
            2,
            self.size - 2,
            self.size - 2,
            fill="",
            outline="",
            width=0,
        )

        self.root.withdraw()
        self._last_pos = None
        self._flash_count = 0
        self._update_loop()

    def _read_pos(self):
        try:
            if os.path.exists(POS_FILE):
                mtime = os.path.getmtime(POS_FILE)
                with open(POS_FILE) as f:
                    data = json.load(f)
                data["_mtime"] = mtime
                return data
        except Exception:
            pass
        return None

    def _read_bounds(self):
        try:
            if os.path.exists(BOUNDS_FILE):
                with open(BOUNDS_FILE) as f:
                    return json.load(f)
        except Exception:
            pass
        return None

    def _update_loop(self):
        pos = self._read_pos()
        bounds = self._read_bounds()

        if pos and bounds:
            bx = bounds.get("x", 0)
            by = bounds.get("y", 0)
            bw = bounds.get("w", 800)
            bh = bounds.get("h", 600)
            x_pct = pos.get("x_pct", 50)
            y_pct = pos.get("y_pct", 50)
            abs_x = int(bx + (x_pct / 100.0) * bw)
            abs_y = int(by + (y_pct / 100.0) * bh)
            geo = f"{self.size}x{self.size}+{abs_x - self.size // 2}+{abs_y - self.size // 2}"
            self.root.geometry(geo)
            self.root.deiconify()

            current_key = (x_pct, y_pct)
            if self._last_pos is not None and current_key != self._last_pos:
                self._start_flash()
            self._last_pos = current_key
        else:
            self.root.withdraw()
            self._last_pos = None

        self._update_flash()
        self.root.after(100, self._update_loop)

    def _start_flash(self):
        self._flash_count = 5
        self.canvas.itemconfigure(self.click_flash, outline="#a29bfe", width=3)

    def _update_flash(self):
        if self._flash_count > 0:
            self._flash_count -= 1
            if self._flash_count == 0:
                self.canvas.itemconfigure(self.click_flash, outline="", width=0)

    def run(self):
        self.root.mainloop()


if __name__ == "__main__":
    PurpleCursor().run()
