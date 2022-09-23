import re
from datetime import date, datetime

YEAR_TAG = 'Y'
MONTH_TAG = 'M'
DATE_TAG = 'D'
HOUR_TAG = 'h'
MIN_TAG = 'm'
SEC_TAG = 's'
EXTENSION_TAG = 'ext'

VARIABLE_MAP = {
    YEAR_TAG    : r'\d{4}',
    MONTH_TAG   : '|'.join( '%.2d'%(i+1) for i in range(12)),
    DATE_TAG    : '|'.join( '%.2d'%(i+1) for i in range(31)),
    HOUR_TAG    : '|'.join( '%.2d'%(i) for i in range(24)),
    MIN_TAG     : '|'.join( '%.2d'%(i) for i in range(60)),
    SEC_TAG     : '|'.join( '%.2d'%(i) for i in range(60)),
    EXTENSION_TAG: r'(?i:\.jpg|\.jpeg|\.gif|\.png|\.bmp)'
}

def inputpattern_to_regex(p: str):
    '''maps a pattern into a regular expression'''
    result = p
    for key in VARIABLE_MAP:
        result = result.replace(
            '{'+ key +'}',
            '(?P<{0}>{1})'.format(key, VARIABLE_MAP[key])
        )

    def subcallback(match):
        g = match.groupdict()
        return '(?P<{0}>{1})'.format(g.get('name'), g.get('exp'))

    result = re.sub(
        r'\{(?P<exp>[^\}:]+):(?P<name>\w+)\}',
        subcallback,
        result
    )

    return result

def build_string_from_pattern(p: str, group: dict) -> str:
    '''Build a string from a pattern and a groupdict containing the values for each pattern key
    Args:
        p (str): pattern
        group (dict): groupdict (key,value)
    Returns:
        str: copy of p obtained by replacing each {key} from p by group[key].
        Will replace any unmatch {key} with __key__
    '''

    r = p
    for key in group:
        r = r.replace(
            '{' + key + '}',
            str(group[key])
        )

    r = r.replace('{','__')
    r = r.replace('}', '__')
    return r

def date_from_group_dict(g: dict) -> datetime:
    try:
        year = int(g[YEAR_TAG])
        month = int(g[MONTH_TAG])
        day = int(g[DATE_TAG])
        hour = int(g.get(HOUR_TAG, '00'))
        minutes = int(g.get(MIN_TAG, '00'))
        seconds = int(g.get(SEC_TAG, '00'))
        return datetime(year, month, day, hour, minutes, seconds)
    except:
        return datetime.today()

def lower_and_replace(s: str) -> str:
    '''Sets a string to lower case and replace special characters'''
    replacements = [
        (' ','_'),
        ('é','e'),
        ('è','e'),
        ('ê','e'),
        ('a','a'),
        ('à','a'),
        ('û','u'),
        ('ù','u'),
    ]

    r = s.lower()

    for char,repl in replacements:
        r = r.replace(char, repl)

    return r