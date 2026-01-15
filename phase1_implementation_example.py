# Phase 1 구현 예제: AOP 데코레이터

"""
이 파일은 Phase 1에서 구현할 AOP 데코레이터의 완전한 예제입니다.
즉시 기존 코드에 적용 가능합니다.
"""

import logging
import time
import hashlib
import json
from functools import wraps
from typing import Callable, Any, Dict, Optional

# ============================================================================
# 1. Logging Aspect
# ============================================================================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def log_execution(func: Callable) -> Callable:
    """
    함수 실행을 자동으로 로깅하는 데코레이터

    사용법:
        @log_execution
        def my_function():
            pass

    로그 출력:
        [START] module.my_function
        [SUCCESS] module.my_function (took 0.52s)
    """
    @wraps(func)
    def wrapper(*args, **kwargs) -> Any:
        func_name = f"{func.__module__}.{func.__name__}"
        logger.info(f"[START] {func_name}")

        start_time = time.time()

        try:
            result = func(*args, **kwargs)
            execution_time = time.time() - start_time
            logger.info(f"[SUCCESS] {func_name} (took {execution_time:.2f}s)")
            return result

        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(
                f"[ERROR] {func_name} failed after {execution_time:.2f}s: {str(e)}",
                exc_info=True
            )
            raise

    return wrapper


# ============================================================================
# 2. Caching Aspect
# ============================================================================

class CacheManager:
    """간단한 인메모리 캐시 매니저"""

    def __init__(self):
        self.cache: Dict[str, tuple[Any, float]] = {}

    def get(self, key: str, ttl: int) -> Optional[Any]:
        """캐시에서 값 조회 (TTL 확인)"""
        if key not in self.cache:
            return None

        value, timestamp = self.cache[key]

        # TTL 체크
        if time.time() - timestamp > ttl:
            del self.cache[key]
            return None

        return value

    def set(self, key: str, value: Any) -> None:
        """캐시에 값 저장"""
        self.cache[key] = (value, time.time())

    def clear(self) -> None:
        """캐시 전체 삭제"""
        self.cache.clear()

    def get_stats(self) -> Dict[str, int]:
        """캐시 통계"""
        return {
            "total_entries": len(self.cache),
            "memory_usage_bytes": sum(
                len(str(k)) + len(str(v[0]))
                for k, v in self.cache.items()
            )
        }


# 전역 캐시 매니저
_cache_manager = CacheManager()


def cached(ttl: int = 300):
    """
    함수 결과를 캐싱하는 데코레이터

    Args:
        ttl: Time To Live (초 단위, 기본 5분)

    사용법:
        @cached(ttl=600)  # 10분 캐싱
        def expensive_function(param):
            return result

    동작:
        - 동일한 파라미터로 호출 시 캐시된 결과 반환
        - TTL 초과 시 재계산
        - OpenAI API 호출 비용 절감에 효과적
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            # 캐시 키 생성
            cache_key = _generate_cache_key(func, args, kwargs)

            # 캐시 확인
            cached_result = _cache_manager.get(cache_key, ttl)
            if cached_result is not None:
                logger.info(f"[CACHE HIT] {func.__name__}")
                return cached_result

            # 캐시 미스: 함수 실행
            logger.info(f"[CACHE MISS] {func.__name__}")
            result = func(*args, **kwargs)

            # 결과 캐싱
            _cache_manager.set(cache_key, result)

            return result

        # 캐시 제어 메서드 추가
        wrapper.clear_cache = _cache_manager.clear
        wrapper.cache_stats = _cache_manager.get_stats

        return wrapper

    return decorator


def _generate_cache_key(func: Callable, args: tuple, kwargs: dict) -> str:
    """파라미터를 기반으로 캐시 키 생성"""
    key_data = {
        "function": f"{func.__module__}.{func.__name__}",
        "args": str(args),
        "kwargs": str(sorted(kwargs.items()))
    }
    key_string = json.dumps(key_data, sort_keys=True)
    return hashlib.md5(key_string.encode()).hexdigest()


# ============================================================================
# 3. Performance Monitoring Aspect
# ============================================================================

class PerformanceMonitor:
    """성능 메트릭 수집 및 분석"""

    def __init__(self):
        self.metrics: Dict[str, list[float]] = {}

    def record(self, func_name: str, execution_time: float) -> None:
        """실행 시간 기록"""
        if func_name not in self.metrics:
            self.metrics[func_name] = []
        self.metrics[func_name].append(execution_time)

    def get_average(self, func_name: str) -> float:
        """평균 실행 시간"""
        if func_name not in self.metrics or not self.metrics[func_name]:
            return 0.0
        return sum(self.metrics[func_name]) / len(self.metrics[func_name])

    def get_stats(self, func_name: str) -> Dict[str, float]:
        """통계 정보"""
        if func_name not in self.metrics or not self.metrics[func_name]:
            return {}

        times = self.metrics[func_name]
        return {
            "count": len(times),
            "average": sum(times) / len(times),
            "min": min(times),
            "max": max(times),
            "total": sum(times)
        }

    def get_all_stats(self) -> Dict[str, Dict[str, float]]:
        """모든 함수의 통계"""
        return {
            func_name: self.get_stats(func_name)
            for func_name in self.metrics.keys()
        }


# 전역 성능 모니터
_performance_monitor = PerformanceMonitor()


def monitor_performance(threshold_ms: float = 1000):
    """
    함수 실행 시간을 측정하고 임계값 초과 시 경고

    Args:
        threshold_ms: 경고 임계값 (밀리초)

    사용법:
        @monitor_performance(threshold_ms=5000)  # 5초 초과 시 경고
        def slow_function():
            pass

    기능:
        - 실행 시간 측정 및 기록
        - 임계값 초과 시 WARNING 로그
        - 통계 정보 수집
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            start_time = time.time()

            try:
                result = func(*args, **kwargs)
                return result
            finally:
                execution_time_ms = (time.time() - start_time) * 1000

                # 메트릭 기록
                _performance_monitor.record(func.__name__, execution_time_ms)

                # 임계값 체크
                if execution_time_ms > threshold_ms:
                    logger.warning(
                        f"[SLOW] {func.__name__} took {execution_time_ms:.2f}ms "
                        f"(threshold: {threshold_ms}ms)"
                    )
                else:
                    logger.debug(
                        f"[PERF] {func.__name__} took {execution_time_ms:.2f}ms"
                    )

        # 통계 조회 메서드 추가
        wrapper.get_stats = lambda: _performance_monitor.get_stats(func.__name__)

        return wrapper

    return decorator


# ============================================================================
# 4. Authentication Aspect
# ============================================================================

def require_auth(roles: list[str] = None):
    """
    인증을 요구하는 데코레이터

    Args:
        roles: 허용된 역할 리스트 (예: ["admin", "user"])

    사용법:
        @require_auth(roles=["admin"])
        def admin_only_function():
            pass

    Note:
        실제 구현에서는 JWT 토큰 검증 등을 추가해야 합니다.
        여기서는 간단한 예제만 제공합니다.
    """
    if roles is None:
        roles = ["user"]

    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            # TODO: 실제 인증 로직 구현
            # 예: JWT 토큰 검증, 세션 확인 등

            # 현재는 단순히 로그만 남김
            logger.info(f"[AUTH] Checking authentication for {func.__name__}")
            logger.info(f"[AUTH] Required roles: {roles}")

            # 함수 실행
            return func(*args, **kwargs)

        return wrapper

    return decorator


# ============================================================================
# 5. 사용 예제
# ============================================================================

if __name__ == "__main__":
    print("=" * 80)
    print("AOP 데코레이터 사용 예제")
    print("=" * 80)

    # 예제 1: 로깅만 적용
    @log_execution
    def simple_function():
        time.sleep(0.1)
        return "Hello, World!"

    print("\n[예제 1] 로깅 데코레이터:")
    result = simple_function()
    print(f"Result: {result}")

    # 예제 2: 캐싱 적용
    @log_execution
    @cached(ttl=60)
    def expensive_calculation(x: int, y: int) -> int:
        """비용이 많이 드는 계산 (AI API 호출 시뮬레이션)"""
        time.sleep(1)  # API 호출 시뮬레이션
        return x + y

    print("\n[예제 2] 캐싱 데코레이터:")
    print("첫 번째 호출 (캐시 미스):")
    result1 = expensive_calculation(10, 20)
    print(f"Result: {result1}")

    print("\n두 번째 호출 (캐시 히트 - 즉시 반환):")
    result2 = expensive_calculation(10, 20)
    print(f"Result: {result2}")

    print("\n캐시 통계:")
    print(expensive_calculation.cache_stats())

    # 예제 3: 성능 모니터링
    @log_execution
    @monitor_performance(threshold_ms=500)
    def api_call_simulation():
        """API 호출 시뮬레이션"""
        time.sleep(0.3)
        return {"status": "success"}

    print("\n[예제 3] 성능 모니터링:")
    for i in range(3):
        api_call_simulation()

    print("\n성능 통계:")
    print(api_call_simulation.get_stats())

    # 예제 4: 모든 데코레이터 조합
    @log_execution
    @monitor_performance(threshold_ms=2000)
    @require_auth(roles=["admin"])
    @cached(ttl=300)
    def complex_function(param1: str, param2: int) -> dict:
        """모든 관점을 적용한 복잡한 함수"""
        time.sleep(0.5)
        return {
            "param1": param1,
            "param2": param2,
            "result": param1 * param2
        }

    print("\n[예제 4] 모든 데코레이터 조합:")
    result = complex_function("test", 3)
    print(f"Result: {result}")

    # 전체 성능 통계
    print("\n" + "=" * 80)
    print("전체 성능 통계:")
    print("=" * 80)
    for func_name, stats in _performance_monitor.get_all_stats().items():
        print(f"\n{func_name}:")
        for key, value in stats.items():
            print(f"  {key}: {value:.2f}")


# ============================================================================
# 6. 실제 Art-AI 프로젝트 적용 예제
# ============================================================================

class RealWorldExample:
    """실제 Art-AI 프로젝트에 적용하는 예제"""

    @log_execution
    @monitor_performance(threshold_ms=5000)
    @cached(ttl=600)  # 10분 캐싱
    def analyze_drawing(self, image_bytes: bytes) -> dict:
        """
        이미지 분석 함수
        - 자동 로깅
        - 5초 초과 시 경고
        - 동일 이미지는 10분간 캐싱
        """
        # 기존 로직 그대로 사용
        # AI API 호출, 분석 등...
        time.sleep(2)  # AI API 시뮬레이션

        return {
            "observations": ["색상이 밝음", "큰 원형"],
            "emotions": ["기쁨", "안정감"],
            "questions": ["이 그림을 그릴 때 기분이 어땠나요?"]
        }

    @log_execution
    @require_auth(roles=["admin"])
    def delete_report(self, report_id: str) -> bool:
        """
        보고서 삭제 (관리자 전용)
        - 자동 로깅
        - 관리자 권한 확인
        """
        # 삭제 로직
        logger.info(f"Deleting report: {report_id}")
        return True


# 사용 예제
if __name__ == "__main__":
    print("\n\n" + "=" * 80)
    print("실제 프로젝트 적용 예제")
    print("=" * 80)

    service = RealWorldExample()

    # 이미지 분석
    print("\n[분석 1] 첫 번째 호출:")
    result = service.analyze_drawing(b"image_data_1")
    print(f"Result: {result}")

    print("\n[분석 2] 동일 이미지 재호출 (캐시됨):")
    result = service.analyze_drawing(b"image_data_1")
    print(f"Result: {result}")

    # 관리자 기능
    print("\n[관리자] 보고서 삭제:")
    service.delete_report("report-123")
