import subprocess

def calculate_severity(result):

    if "mysql" in result:
        return "High"

    if "ssh" in result:
        return "Medium"

    if "http" in result:
        return "Low"

    return "Info"


def run_scan(target):

    command = ["nmap","-sV",target]

    result = subprocess.run(
        command,
        capture_output=True,
        text=True
    )

    output = result.stdout

    severity = calculate_severity(output)

    return output,severity