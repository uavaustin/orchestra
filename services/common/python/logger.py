"""Standardized service-level logger utils."""

import logging

from termcolor import colored


def configure_logger():
    """Configure the built-in root Python logger."""
    logger = logging.getLogger()
    handler = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s %(levelname)-8s %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


def format_error(type, message):
    """Format an error message with color."""
    return colored(type + ': ', 'red', attrs=['bold']) + message