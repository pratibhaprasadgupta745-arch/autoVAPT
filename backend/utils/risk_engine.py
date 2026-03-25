# AutoVAPT Risk Scoring Engine

def calculate_risk_score(vulnerabilities):
    """
    Calculate risk score based on vulnerability severity.
    Score starts from 100 and decreases based on severity.
    """

    # If no vulnerabilities found
    if not vulnerabilities:
        return None  # means scan not run yet

    score = 100

    for v in vulnerabilities:
        severity = (v.get("severity") or "").lower()

        if severity == "critical":
            score -= 25
        elif severity == "high":
            score -= 15
        elif severity == "medium":
            score -= 8
        elif severity == "low":
            score -= 3

    # Ensure score stays between 0 - 100
    if score < 0:
        score = 0
    if score > 100:
        score = 100

    return score


def get_risk_level(score):
    """
    Convert numeric score into risk category
    """

    if score is None:
        return "Not Scanned"

    if score >= 80:
        return "Low Risk"
    elif score >= 50:
        return "Medium Risk"
    elif score >= 20:
        return "High Risk"
    else:
        return "Critical Risk"