import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Note } from './note.model';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  notes: Note[] = [];
  savedNotes: BehaviorSubject<Note[]> = new BehaviorSubject<Note[]>([]);

  addNote() {
    const newNote = new Note(Date.now(), '', '', '#90EE90');
    this.notes.push(newNote);
  }

  ngOnInit() {
    const loadedNotes: Note[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('note-')) {
        const item = localStorage.getItem(key);
        if (item) {
          const note = JSON.parse(item);
          loadedNotes.push(note);
        }
      }
    }
    const recentNotes = loadedNotes.sort((a, b) => b.id - a.id).slice(0, 5);
    this.savedNotes.next(recentNotes);
  }

  saveNote(note: Note) {
    note.id = Date.now();
    const existingNotes = this.savedNotes.getValue();
    const existingNoteIndex = existingNotes.findIndex(savedNote => savedNote.id === note.id);
    
    if (existingNoteIndex !== -1) {
      existingNotes[existingNoteIndex] = note;
    } else {
      if (existingNotes.length >= 5) {
        const oldestNoteId = Math.min(...existingNotes.map(note => note.id));
        const oldestNoteIndex = existingNotes.findIndex(note => note.id === oldestNoteId);
        if (oldestNoteIndex !== -1) {
          existingNotes.splice(oldestNoteIndex, 1);
        }
        localStorage.removeItem(`note-${oldestNoteId}`);
        existingNotes.push(note);
      }
    }
    localStorage.setItem(`note-${note.id}`, JSON.stringify(note));
    this.savedNotes.next([...existingNotes]);
    this.ngOnInit();
  }
  
  

  loadNote(id: number) {
    const savedNote = this.savedNotes.getValue().find(note => note.id === id);
    if (savedNote) {
      const note = this.notes[0];
      note.id = savedNote.id;
      note.title = savedNote.title;
      note.content = savedNote.content;
      note.color = savedNote.color;
    }
  }
  
  handleSelectChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const selectedId = Number(selectElement.value);
    this.loadNote(selectedId);
  }

  constructor() {
    this.addNote();
  }
}


