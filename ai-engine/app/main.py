import argparse
import json
import sys
from pathlib import Path

from pydantic import ValidationError

from app.models.input_models import TimetableInput
from app.services.timetable_solver import generate_timetable
from app.utils.backend_payload_normalizer import normalize_backend_payload


BASE_DIR = Path(__file__).resolve().parent.parent
DEFAULT_INPUT_FILE = BASE_DIR / "runtime" / "input.json"
DEFAULT_OUTPUT_FILE = BASE_DIR / "runtime" / "output.json"


def main():
    parser = argparse.ArgumentParser(
        description="CampusSync AI Timetable Generation Engine"
    )

    parser.add_argument(
        "--input",
        default=str(DEFAULT_INPUT_FILE),
        help="Path to real backend-shaped timetable input JSON."
    )

    parser.add_argument(
        "--output",
        default=str(DEFAULT_OUTPUT_FILE),
        help="Path to generated timetable output JSON."
    )

    args = parser.parse_args()

    input_file = Path(args.input)
    output_file = Path(args.output)

    if not input_file.exists():
        print("")
        print("ERROR: Real input JSON not found.")
        print(f"Expected file: {input_file}")
        print("")
        print("Create runtime/input.json using real backend data.")
        print("")
        sys.exit(1)

    try:
        with open(input_file, "r", encoding="utf-8-sig") as file:
            raw_data = json.load(file)

        normalized_data = normalize_backend_payload(raw_data)

        timetable_input = TimetableInput(**normalized_data)
        result = generate_timetable(timetable_input)

        output_file.parent.mkdir(parents=True, exist_ok=True)

        with open(output_file, "w", encoding="utf-8") as file:
            json.dump(result.model_dump(), file, indent=4)

        print(json.dumps(result.model_dump(), indent=4))
        print("")
        print(f"Output written to: {output_file}")

    except ValidationError as error:
        print("")
        print("ERROR: Input JSON schema validation failed.")
        print(error)
        print("")
        sys.exit(1)

    except Exception as error:
        print("")
        print("ERROR: Timetable generation failed.")
        print(str(error))
        print("")
        sys.exit(1)


if __name__ == "__main__":
    main()
