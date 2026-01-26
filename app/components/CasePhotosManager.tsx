"use client";
import React, { useEffect, useState } from 'react';

export default function CasePhotosManager({ caseId }: { caseId: number }) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    try {
      const map = JSON.parse(localStorage.getItem('casePhotos') || '{}');
      setPhotos(map[caseId] || []);
    } catch { setPhotos([]); }
    try {
      const raw = sessionStorage.getItem('user');
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, [caseId]);

  function saveMap(newMap: any) {
    try {
      localStorage.setItem('casePhotos', JSON.stringify(newMap));
    } catch {}
  }

  function onFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const readers: Promise<string>[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      readers.push(new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(String(r.result));
        r.onerror = rej;
        r.readAsDataURL(f);
      }));
    }
    Promise.all(readers).then((dataUrls) => {
      const newPhotos = [...photos, ...dataUrls];
      setPhotos(newPhotos);
      try {
        const map = JSON.parse(localStorage.getItem('casePhotos') || '{}');
        map[caseId] = newPhotos;
        saveMap(map);
        // activity log
        const log = JSON.parse(localStorage.getItem('activityLog') || '[]');
        log.push({ ts: new Date().toISOString(), action: 'add_case_photos', details: `Added ${dataUrls.length} photo(s) to case ${caseId}`, caseId });
        localStorage.setItem('activityLog', JSON.stringify(log));
      } catch {}
    }).catch(() => {});
  }

  function removeAt(idx: number) {
    const next = photos.filter((_, i) => i !== idx);
    setPhotos(next);
    try {
      const map = JSON.parse(localStorage.getItem('casePhotos') || '{}');
      map[caseId] = next;
      saveMap(map);
      const log = JSON.parse(localStorage.getItem('activityLog') || '[]');
      log.push({ ts: new Date().toISOString(), action: 'remove_case_photo', details: `Removed photo ${idx} from case ${caseId}`, caseId });
      localStorage.setItem('activityLog', JSON.stringify(log));
    } catch {}
  }

  const editable = !!user && (user.role === "police_officer" || user.role === "colonel");

  if (!editable) {
    // show photos read-only to others
    return (
      <div className="mt-4">
        <h4 className="font-medium">Case photos</h4>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {photos.map((p, i) => (
            <div key={i}>
              <img src={p} alt={`photo-${i}`} className="w-full h-32 object-cover rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h4 className="font-medium">Case photos</h4>
      <input type="file" multiple accept="image/*" onChange={onFiles} className="mt-2" />
      <div className="mt-3 grid grid-cols-3 gap-2">
        {photos.map((p, i) => (
          <div key={i} className="relative">
            <img src={p} alt={`photo-${i}`} className="w-full h-32 object-cover rounded" />
            <button onClick={() => removeAt(i)} className="absolute top-1 right-1 bg-red-600 text-white px-2 py-1 text-xs rounded">Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}
