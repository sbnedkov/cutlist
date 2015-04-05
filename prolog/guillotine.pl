# TODO: rotate parts

solution(_, [], _).
solution(Slates, [Part|T], [PartCoord]) :-
    guillotine(Slates, Part, NewSlates, PartCoord),
    solution(NewSlates, T, []).
solution(Slates, [Part|T], [PartCoord|Result]) :-
    guillotine(Slates, Part, NewSlates, PartCoord),
    solution(NewSlates, T, Result).

guillotine([Slate|T], [W, H], [S1, S2 |T], [X, Y, W, H]) :-
    placepart(Slate, [X, Y, W, H]),
    splitslates(Slate, [W, H], [S1, S2]).
guillotine([_|T], Part, NewSlates, PartCoord) :-
    guillotine(T, Part, NewSlates, PartCoord).

splitslates([Sx, Sy, Sw, Sh], [W, H], [[Nsx, Sy, Nsw, Sh], [Sx, Nsy, W, Nsh]]) :-
    Nsx is Sx + W,
    Nsw is Sw - W,
    Nsy is Sy + H,
    Nsh is Sh - H.
splitslates([Sx, Sy, Sw, Sh], [W, H], [[Nsx, Sy, Nsw, H], [Sx, Nsy, Sw, Nsh]]) :-
    Nsx is Sx + W,
    Nsw is Sw - W,
    Nsy is Sy + H,
    Nsh is Sh - H.

placepart([Sx, Sy, Sw, Sh], [X, Y, W, H]) :-
    X is Sx,
    Y is Sy,
    W =< Sw,
    H =< Sh.
