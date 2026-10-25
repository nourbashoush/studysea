// Seeds demo data (friends, tasks, study history, posts, a league) through the REST API.
// Run with the app up on :8080 in the dev profile: node scripts/seed-demo-data.mjs

const B = 'http://localhost:8080/api';
const login = async (u, p) => (await (await fetch(B + '/authenticate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u, password: p }) })).json()).id_token;
const api = tok => async (method, path, body) => { const r = await fetch(B + path, { method, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + tok }, body: body ? JSON.stringify(body) : undefined }); const t = await r.text(); if (!r.ok) console.log('ERR', method, path, r.status, t.slice(0, 200)); try { return JSON.parse(t); } catch { return t; } };
const U = api(await login('user', 'user')), A = api(await login('admin', 'admin'));
const ua = await U('GET', '/account'), aa = await A('GET', '/account');
const ue = await U('GET', `/user-extendeds/by-user/${ua.id}`), ae = await A('GET', `/user-extendeds/by-user/${aa.id}`);
console.log('ue', ue.id, 'ae', ae.id);
await U('PATCH', `/user-extendeds/${ue.id}`, { id: ue.id, firstName: 'Sam', lastName: 'Rivers', institution: 'University of Birmingham', course: 'Computer Science', description: 'Second-year CS student. Pomodoro devotee.' }).catch(()=>{});
await U('POST', '/friends/by-userx', [ue, ae]);
const now = Date.now(), h = 3600e3, d = 24 * h, iso = t => new Date(t).toISOString();
const upcoming = [['Revise graph algorithms', 'Algorithms', 2], ['Finish Spring Boot coursework', 'Software Engineering', 5], ['Read chapter 4: probability', 'Maths', 26], ['Lab prep: TCP handshake', 'Networks', 50]];
for (const [title, subject, inH] of upcoming) await U('POST', '/tasks', { title, subject, start: iso(now + inH * h), creation: iso(now - d), studyLength: 25, breakLength: 5, completed: false, createdBy: ue });
const done = [['Dijkstra practice problems', 'Algorithms', 'PT2H30M', 1], ['Requirements doc draft', 'Software Engineering', 'PT3H', 2], ['Linear algebra exercises', 'Maths', 'PT1H15M', 3], ['Subnetting worksheet', 'Networks', 'PT45M', 4], ['Sprint retro notes', 'Software Engineering', 'PT1H', 5], ['Dynamic programming', 'Algorithms', 'PT1H45M', 6]];
for (const [title, subject, dur, ago] of done) { const t = await U('POST', '/tasks', { title, subject, start: iso(now - ago * d), creation: iso(now - ago * d - h), studyLength: 50, breakLength: 10, completed: true, createdBy: ue }); await U('POST', '/after-studies', { timeSpent: dur, task: { id: t.id } }); }
for (const [title, subject, dur, ago] of [['Operating systems revision', 'Systems', 'PT4H', 1], ['Compiler lab', 'Systems', 'PT2H', 3]]) { const t = await A('POST', '/tasks', { title, subject, start: iso(now - ago * d), creation: iso(now - ago * d - h), studyLength: 50, breakLength: 10, completed: true, createdBy: ae }); await A('POST', '/after-studies', { timeSpent: dur, task: { id: t.id } }); }
await A('POST', '/posts', { createdBy: 'admin', creationTime: iso(now - 3 * h), title: 'Four Pomodoros before lunch', description: 'Turns out 25 minutes on, 5 off really does work. Who is up for a group session tonight?', likes: 1, likedBy: 'user' });
await U('POST', '/posts', { createdBy: 'user', creationTime: iso(now - 26 * h), title: 'Finally finished the coursework', description: 'Three study sessions with friends and it is done. The break chat kept me sane.', likes: 0, likedBy: '' });
const posts = await U('GET', '/posts');
const p = posts.find(x => x.createdBy === 'admin');
if (p) await U('POST', '/comments', { content: 'Count me in, 7pm?', author: 'user', postID: String(p.id), creationTime: iso(now - 2 * h) });
await U('POST', '/league-tables', { name: 'CS Year 2 Study Squad', members: [ue, ae] });
console.log('done');
