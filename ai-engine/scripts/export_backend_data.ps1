param(
    [string]$BaseUrl = "http://localhost:5000/api/v1"
)

$ErrorActionPreference = "Stop"

function Find-Token($obj) {
    if ($null -eq $obj) {
        return $null
    }

    $possibleNames = @("token", "accessToken", "jwt")

    foreach ($name in $possibleNames) {
        if ($obj.PSObject.Properties.Name -contains $name) {
            return $obj.$name
        }
    }

    foreach ($property in $obj.PSObject.Properties) {
        if ($property.Value -is [string]) {
            continue
        }

        $found = Find-Token $property.Value

        if ($found) {
            return $found
        }
    }

    return $null
}

function Find-Array($obj) {
    if ($null -eq $obj) {
        return @()
    }

    if ($obj -is [System.Array]) {
        return $obj
    }

    $priorityNames = @("data", "items", "records", "results")

    foreach ($name in $priorityNames) {
        if ($obj.PSObject.Properties.Name -contains $name) {
            $value = $obj.$name

            if ($value -is [System.Array]) {
                return $value
            }

            $nested = Find-Array $value

            if ($nested.Count -gt 0) {
                return $nested
            }
        }
    }

    foreach ($property in $obj.PSObject.Properties) {
        $value = $property.Value

        if ($value -is [System.Array]) {
            return $value
        }

        if ($value -isnot [string]) {
            $nested = Find-Array $value

            if ($nested.Count -gt 0) {
                return $nested
            }
        }
    }

    return @()
}

function Get-FirstWorkingCollection($name, $paths, $headers) {
    foreach ($path in $paths) {
        $url = "$BaseUrl$path"

        try {
            Write-Host "Fetching $name from $url"
            $response = Invoke-RestMethod -Method GET -Uri $url -Headers $headers
            $items = Find-Array $response

            Write-Host "Loaded $($items.Count) $name"
            return $items
        }
        catch {
            Write-Host "Skipped $url"
        }
    }

    Write-Host "No working endpoint found for $name"
    return @()
}

$email = Read-Host "Enter ADMIN/HOD email"
$password = Read-Host "Enter password"

$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod `
    -Method POST `
    -Uri "$BaseUrl/auth/login" `
    -ContentType "application/json" `
    -Body $loginBody

$token = Find-Token $loginResponse

if (-not $token) {
    Write-Host "Login response:"
    $loginResponse | ConvertTo-Json -Depth 10
    throw "JWT token not found in login response."
}

$headers = @{
    Authorization = "Bearer $token"
}

$departments = Get-FirstWorkingCollection "departments" @(
    "/departments",
    "/department"
) $headers

$faculties = Get-FirstWorkingCollection "faculties" @(
    "/faculties",
    "/faculty"
) $headers

$students = Get-FirstWorkingCollection "students" @(
    "/students",
    "/student"
) $headers

$subjects = Get-FirstWorkingCollection "subjects" @(
    "/subjects",
    "/subject"
) $headers

$rooms = Get-FirstWorkingCollection "rooms" @(
    "/rooms",
    "/room"
) $headers

$timeSlots = Get-FirstWorkingCollection "timeSlots" @(
    "/timeslots",
    "/time-slots",
    "/timeSlots"
) $headers

$courseSelections = Get-FirstWorkingCollection "courseSelections" @(
    "/course-selections",
    "/courseSelections",
    "/course-selection"
) $headers

$result = @{
    departments = $departments
    faculties = $faculties
    students = $students
    subjects = $subjects
    rooms = $rooms
    timeSlots = $timeSlots
    courseSelections = $courseSelections
}

New-Item -ItemType Directory -Force -Path runtime | Out-Null

$result | ConvertTo-Json -Depth 20 | Set-Content -Path runtime\input.json -Encoding UTF8

Write-Host ""
Write-Host "Real backend data exported to runtime/input.json"
Write-Host ""
Write-Host "Counts:"
Write-Host "Departments:       $($departments.Count)"
Write-Host "Faculties:         $($faculties.Count)"
Write-Host "Students:          $($students.Count)"
Write-Host "Subjects:          $($subjects.Count)"
Write-Host "Rooms:             $($rooms.Count)"
Write-Host "TimeSlots:         $($timeSlots.Count)"
Write-Host "CourseSelections:  $($courseSelections.Count)"
