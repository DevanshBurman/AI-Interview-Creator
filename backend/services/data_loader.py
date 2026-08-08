import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any

from backend.schemas.candidate import CandidateProfile
from backend.schemas.curriculum import CurriculumData, CurriculumDay, CurriculumModule

logger = logging.getLogger(__name__)

class DataLoader:
    """
    Singleton service that loads curriculum.json and candidates.json into memory once on application startup.
    Provides fast in-memory lookup methods for candidate profiles, curriculum days, and learning objectives.
    """

    def __init__(self):
        self._candidates_by_id: Dict[str, CandidateProfile] = {}
        self._curriculum_days_by_day: Dict[int, CurriculumDay] = {}
        self._curriculum_modules: List[CurriculumModule] = []
        self._curriculum_raw: Optional[CurriculumData] = None
        self._is_loaded: bool = False

    def get_base_dir(self) -> Path:
        """Find root directory containing curriculum.json and candidates.json."""
        # Check current working directory first, then resolve relative to backend package
        cwd = Path.cwd()
        if (cwd / "curriculum.json").exists() and (cwd / "candidates.json").exists():
            return cwd
        
        # Fallback to parent of backend
        parent = Path(__file__).resolve().parents[2]
        if (parent / "curriculum.json").exists() and (parent / "candidates.json").exists():
            return parent

        # Fallback search
        for candidate_path in [cwd, parent, Path.cwd().parent]:
            if (candidate_path / "curriculum.json").exists():
                return candidate_path
        
        return cwd

    def load_data(self, base_path: Optional[Path] = None) -> None:
        """Load curriculum.json and candidates.json once into memory."""
        if self._is_loaded and base_path is None:
            logger.info("Data already loaded in memory.")
            return

        target_dir = base_path or self.get_base_dir()
        curriculum_file = target_dir / "curriculum.json"
        candidates_file = target_dir / "candidates.json"

        if not curriculum_file.exists():
            raise FileNotFoundError(f"curriculum.json not found at {curriculum_file}")
        if not candidates_file.exists():
            raise FileNotFoundError(f"candidates.json not found at {candidates_file}")

        # 1. Load Curriculum JSON
        with open(curriculum_file, "r", encoding="utf-8") as f:
            curriculum_dict = json.load(f)
            self._curriculum_raw = CurriculumData(**curriculum_dict)
            self._curriculum_days_by_day = {
                day_item.day: day_item for day_item in self._curriculum_raw.days
            }
            self._curriculum_modules = self._curriculum_raw.modules

        # 2. Load Candidates JSON
        with open(candidates_file, "r", encoding="utf-8") as f:
            candidates_dict = json.load(f)
            candidate_list = candidates_dict.get("candidates", [])
            self._candidates_by_id = {}
            for cand_data in candidate_list:
                cand_profile = CandidateProfile(**cand_data)
                self._candidates_by_id[cand_profile.member.id] = cand_profile

        self._is_loaded = True
        logger.info(
            f"Successfully loaded {len(self._curriculum_days_by_day)} curriculum days and "
            f"{len(self._candidates_by_id)} candidate profiles into memory."
        )

    def is_loaded(self) -> bool:
        """Check if data is loaded."""
        return self._is_loaded

    def get_candidate_by_id(self, candidate_id: str) -> Optional[CandidateProfile]:
        """Retrieve candidate profile by ID (e.g., 'CAND-001')."""
        if not self._is_loaded:
            self.load_data()
        return self._candidates_by_id.get(candidate_id)

    def get_all_candidates(self) -> List[CandidateProfile]:
        """Retrieve all loaded candidate profiles."""
        if not self._is_loaded:
            self.load_data()
        return list(self._candidates_by_id.values())

    def get_curriculum_day(self, day_number: int) -> Optional[CurriculumDay]:
        """Retrieve curriculum day details by day number (1-31)."""
        if not self._is_loaded:
            self.load_data()
        return self._curriculum_days_by_day.get(day_number)

    def get_learning_objectives(self, day_number: int) -> List[str]:
        """Retrieve learning objectives for a specific curriculum day."""
        day_obj = self.get_curriculum_day(day_number)
        return day_obj.objectives if day_obj else []

    def get_all_curriculum_days(self) -> List[CurriculumDay]:
        """Retrieve all curriculum days sorted by day number."""
        if not self._is_loaded:
            self.load_data()
        return [self._curriculum_days_by_day[k] for k in sorted(self._curriculum_days_by_day.keys())]

    def get_module_for_day(self, day_number: int) -> Optional[CurriculumModule]:
        """Identify which curriculum module covers a given day number."""
        if not self._is_loaded:
            self.load_data()
        for module in self._curriculum_modules:
            if len(module.days) == 2 and module.days[0] <= day_number <= module.days[1]:
                return module
        return None

# Global singleton instance
data_loader = DataLoader()
