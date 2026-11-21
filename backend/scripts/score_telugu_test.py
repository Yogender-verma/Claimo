import json
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.extract import extract_facts_from_story

def score_test_set():
  data_file = Path(__file__).resolve().parent.parent / "data" / "telugu_test_set.json"
  if not data_file.exists():
    print(f"Error: {data_file} not found.")
    return 1

  with open(data_file, "r", encoding="utf-8") as f:
    test_cases = json.load(f)

  total_fields = 0
  matched_fields = 0
  total_cases = len(test_cases)
  passed_cases = 0

  print(f"\n==================================================")
  print(f"Scoring Telugu & English Story Extraction ({total_cases} cases)")
  print(f"==================================================")

  for case in test_cases:
    case_id = case["id"]
    text = case["text"]
    expected = case["expected"]
    
    actual = extract_facts_from_story(text).model_dump()
    
    case_success = True
    print(f"\n[Case {case_id}]")
    print(f"Text: {text[:60]}...")
    
    for field, exp_val in expected.items():
      total_fields += 1
      act_val = actual.get(field)
      if act_val == exp_val:
        matched_fields += 1
        print(f"  [PASS] {field}: {act_val}")
      else:
        case_success = False
        print(f"  [FAIL] {field}: expected {exp_val}, got {act_val}")
        
    if case_success:
      passed_cases += 1

  field_accuracy = (matched_fields / total_fields) * 100 if total_fields else 0
  print(f"\n==================================================")
  print(f"Summary: {passed_cases}/{total_cases} cases fully passed.")
  print(f"Field accuracy: {matched_fields}/{total_fields} ({field_accuracy:.1f}%)")
  print(f"==================================================\n")

  return 0 if passed_cases == total_cases else 1

if __name__ == "__main__":
  sys.exit(score_test_set())
