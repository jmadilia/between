def _personas(client):
  return {p["name"]: p for p in client.get("/demo/personas").json()}


def test_seeded_personas(client):
  personas = client.get("/demo/personas").json()
  assert personas[0]["role"] == "therapist"
  names = {p["name"] for p in personas}
  assert {"Alice Johnson", "Bob Smith", "Carol Rivera"} <= names
  assert all(p["onboarding_completed"] for p in personas)


def test_api_prefix_is_accepted(client):
  assert client.get("/api/demo/personas").json() == client.get("/demo/personas").json()


def test_patient_reflection_persists_and_is_visible_to_therapist(client):
  alice = _personas(client)["Alice Johnson"]
  headers = {"X-Demo-User-Id": str(alice["id"])}

  res = client.post(
    "/api/reflections/",
    json={"patient_id": alice["id"], "content": "Slept better.", "mood": 4, "symptom_severity": 2},
    headers=headers,
  )
  assert res.status_code == 201, res.text

  own = client.get(f"/api/reflections/?patient_id={alice['id']}", headers=headers).json()
  assert own[0]["content"] == "Slept better."

  # Therapist (default identity) sees it too.
  therapist_view = client.get(f"/api/reflections/?patient_id={alice['id']}").json()
  assert therapist_view[0]["content"] == "Slept better."


def test_patient_cannot_write_or_read_for_someone_else(client):
  p = _personas(client)
  headers = {"X-Demo-User-Id": str(p["Alice Johnson"]["id"])}
  bob_id = p["Bob Smith"]["id"]
  res = client.post(
    "/reflections/",
    json={"patient_id": bob_id, "content": "x", "mood": 3, "symptom_severity": 3},
    headers=headers,
  )
  assert res.status_code == 403
  assert client.get(f"/reflections/?patient_id={bob_id}", headers=headers).status_code == 403
  assert client.get("/patients/", headers=headers).status_code == 403


def test_new_patient_onboarding_then_reset(client):
  res = client.post("/demo/patients", json={"name": "Jordan Lee"})
  assert res.status_code == 201
  new = res.json()
  assert new["onboarding_completed"] is False

  pid = new["id"]
  client.post("/onboarding/profile", json={
    "patient_id": pid, "date_of_birth": None, "pronouns": "they/them",
    "emergency_contact_name": None, "emergency_contact_phone": None,
    "presenting_concerns": "Stress", "goals": "Sleep more",
  }).raise_for_status()
  client.post("/onboarding/consent", json={"patient_id": pid}).raise_for_status()
  assert client.get(f"/onboarding/status/{pid}").json()["completed"] is True
  assert "Jordan Lee" in _personas(client)

  assert client.post("/demo/reset").status_code == 204
  assert "Jordan Lee" not in _personas(client)


def test_documentation_is_seeded(client):
  p = _personas(client)
  assert len(client.get(f"/soap-notes/?patient_id={p['Alice Johnson']['id']}").json()) == 1
  assert len(client.get(f"/dap-notes/?patient_id={p['Bob Smith']['id']}").json()) == 1


def test_insights_fall_back_without_ai_key(client):
  alice = _personas(client)["Alice Johnson"]
  res = client.get(f"/insights/{alice['id']}")
  assert res.status_code == 200
  assert res.json()["summary"]
